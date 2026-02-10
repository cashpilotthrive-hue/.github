# FBchat Examples & Automation

This repository contains practical examples for automating Facebook Messenger using the `fbchat` library.

## Features
- **Scheduled Messenger**: Send messages at specific times daily using the `schedule` library.
- **Template Messenger**: JSON-based template system for dynamic messaging.

## Usage
```bash
# For scheduled messages
python3 scheduled_messenger.py

# For template messages
python3 template_messenger.py
```

The templates are stored in `message_templates.json`.

## Requirements
- `fbchat`
- `schedule`

Install dependencies:
```bash
pip install fbchat schedule
```

## Netlify Deployment
This repository includes a Netlify configuration for CI/CD documentation. The static site is located in the `public/` directory.
