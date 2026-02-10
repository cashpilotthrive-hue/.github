# Facebook Messenger Bot

A simple Python-based Facebook Messenger bot that supports immediate messaging, template-based messaging, and daily scheduled messaging.

## Features
- **Simple Messaging**: Send a direct message to any friend.
- **Template-based Messaging**: Use predefined templates with placeholders like `{name}` and `{custom_input}`.
- **Scheduled Messaging**: Schedule a message to be sent at a specific time every day.
- **Error Handling**: Basic handling for login failures and friend search issues.

## Prerequisites
- Python 3.6+
- A Facebook account (Note: 2FA might need to be disabled or you might need a session cookie if standard login fails).

## Installation
1. Clone the repository.
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage
1. Run the bot:
   ```bash
   python main.py
   ```
2. Enter your Facebook credentials when prompted.
3. Choose an option from the menu.

## Message Templates
Templates are stored in `message_templates.json`. You can add your own templates following this format:
```json
{
  "TemplateName": {
    "part1": "Hello {name}!",
    "part2": "I am {custom_input}."
  }
}
```

## Troubleshooting
- **Login Failures**: Facebook often blocks automated logins. If you encounter issues, ensure your credentials are correct. You may need to use a session cookie for more reliable authentication (not implemented in this version).
- **Friend Search**: Searching for friends might return multiple users or none if the name is too generic or privacy settings prevent it.
