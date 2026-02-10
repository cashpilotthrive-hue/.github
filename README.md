# FBchat Examples

This repository contains examples of how to use the `fbchat` library for various automated messaging tasks.

## Scheduled Messages

The `scheduled_messenger.py` script uses the `schedule` library to send a message at a specific time every day. It demonstrates how to combine `fbchat` with other Python libraries to create more complex functionality.

### Usage

```bash
python scheduled_messenger.py
```

## Message Templates

For more complex messaging needs, you might want to implement a template system. The `template_messenger.py` script demonstrates how to load message templates from a JSON file and fill in placeholders dynamically.

### Usage

```bash
python template_messenger.py
```

The templates are stored in `message_templates.json`.

## Requirements

- `fbchat`
- `schedule`

You can install the dependencies using:

```bash
pip install fbchat schedule
```

## Netlify Deployment

This repository includes a Netlify configuration to satisfy CI requirements. The static site is located in the `public/` directory.
