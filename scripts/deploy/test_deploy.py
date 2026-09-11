"""Regression checks for public settings and shared-server activation failures."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('public_config', HERE / 'public-config.py')
public_config = importlib.util.module_from_spec(spec)
spec.loader.exec_module(public_config)


class PublicConfigTests(unittest.TestCase):
    def output(self, values):
        return ('SSH banner\nPDK_PUBLIC_CONFIG_BEGIN\n' + json.dumps({
            'services': {'config': {'environment': values}}
        }) + '\nPDK_PUBLIC_CONFIG_END\n✅ Successfully executed commands to all hosts.\n')

    def test_real_keys_and_action_banner(self):
        result = public_config.build_settings(self.output({
            'PUBLIC_GTM_ID': 'GTM-5MKF4JB',
            'PUBLIC_TURNSTILE_SITEKEY': '0x4AAAA-test-key',
            'PRIVATE_SETTING': 'never-export-this',
        }))
        self.assertEqual(result, 'PUBLIC_GTM_ID=GTM-5MKF4JB\nPUBLIC_TURNSTILE_SITEKEY=0x4AAAA-test-key\n')

    def test_empty_configuration(self):
        self.assertEqual(public_config.build_settings(self.output({})),
                         'PUBLIC_GTM_ID=\nPUBLIC_TURNSTILE_SITEKEY=\n')

    def test_reject_env_injection(self):
        for value in ['key\nOTHER=value', 'key\rOTHER=value', 'key\0', 123]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                public_config.build_settings(self.output({'PUBLIC_GTM_ID': value}))

    def test_missing_or_duplicate_payload(self):
        for output in ['{}', self.output({}) * 2]:
            with self.assertRaises(ValueError):
                public_config.build_settings(output)


class ActivationTests(unittest.TestCase):
    def activate(self, scenario):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'bin').mkdir()
            release = root / 'releases/1-1'
            release.mkdir(parents=True)
            if scenario != 'missing_env':
                (root / '.env').write_text('MAIL_TO=private@example.com\n')
                (root / '.env.local').write_text('COMPOSE_PROJECT_NAME=existing-project\n')
            for name in ['images.tar', 'images.tar.sha256', 'images.env', 'docker-compose.yml']:
                (release / name).write_text('release')
            mocks = {
                'docker': '''#!/bin/bash
printf '%s\\n' "$*" >> "$COMMAND_LOG"
case "$SCENARIO:$*" in
  config_failure:*'config --quiet'*) exit 1;;
  load_failure:load*) exit 1;;
  nginx_failure:*'nginx -t'*) exit 1;;
esac
''',
                'flock': '#!/bin/sh\n[ "$SCENARIO" != locked ]\n',
                'sha256sum': '#!/bin/sh\n[ "$SCENARIO" != checksum_failure ]\n',
                'curl': '#!/bin/sh\n[ "$SCENARIO" != http_failure ]\n',
                'sleep': '#!/bin/sh\nexit 0\n',
            }
            for name, code in mocks.items():
                path = root / 'bin' / name
                path.write_text(code)
                path.chmod(0o755)
            script = root / 'activate.sh'
            script.write_text((HERE / 'activate.sh').read_text().replace('/home/pdk_new/website', directory))
            env = dict(os.environ, PATH=str(root / 'bin') + ':' + os.environ['PATH'],
                       COMMAND_LOG=str(root / 'commands'), SCENARIO=scenario)
            argument = '../bad' if scenario == 'invalid_release' else 'releases/1-1'
            result = subprocess.run(['bash', str(script), argument], env=env,
                                    capture_output=True, text=True)
            commands = (root / 'commands').read_text() if (root / 'commands').exists() else ''
            self.assertEqual(result.returncode == 0, scenario == 'success', result.stderr)
            for forbidden in ['--remove-orphans', ' down', ' restart', ' prune', ' build']:
                self.assertNotIn(forbidden, commands)
            changed = scenario in ['success', 'http_failure']
            self.assertEqual('up -d --no-build --pull never web api' in commands, changed)
            self.assertEqual((root / '.images.env').exists(), scenario == 'success')
            self.assertEqual((release / 'images.tar').exists(), scenario != 'success')
            if 'up -d' in commands:
                self.assertIn('--project-directory ' + directory, commands)
                self.assertIn('--env-file .env --env-file .env.local --env-file releases/1-1/images.env', commands)
            if scenario in ['checksum_failure', 'config_failure', 'missing_env', 'locked', 'invalid_release']:
                self.assertNotIn('load --input', commands)
                self.assertNotIn('up -d', commands)
            if scenario == 'http_failure':
                self.assertIn('logs --tail=50 web api', commands)

    def test_activation_and_failure_boundaries(self):
        for scenario in ['success', 'missing_env', 'invalid_release', 'locked',
                         'config_failure', 'checksum_failure', 'load_failure',
                         'nginx_failure', 'http_failure']:
            with self.subTest(scenario=scenario):
                self.activate(scenario)


if __name__ == '__main__':
    unittest.main()
