"""Extract only public build settings from ssh-action's captured output."""
import json
import os


def build_settings(output):
    begin = 'PDK_PUBLIC_CONFIG_BEGIN\n'
    end = '\nPDK_PUBLIC_CONFIG_END'
    if output.count(begin) != 1 or output.count(end) != 1:
        raise ValueError('Missing or ambiguous public configuration markers')
    payload = output.split(begin, 1)[1].split(end, 1)[0]
    config = json.loads(payload)['services']['config']['environment']
    lines = []
    for key in ('PUBLIC_GTM_ID', 'PUBLIC_TURNSTILE_SITEKEY'):
        value = config.get(key) or ''
        if not isinstance(value, str) or any(c in value for c in '\r\n\0'):
            raise ValueError('Invalid public setting')
        lines.append(f'{key}={value}\n')
    return ''.join(lines)


if __name__ == '__main__':
    settings = build_settings(os.environ['PUBLIC_CONFIG'])
    with open(os.environ['GITHUB_ENV'], 'a') as out:
        out.write(settings)
