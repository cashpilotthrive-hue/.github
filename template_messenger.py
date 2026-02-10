import fbchat
from getpass import getpass
import json
import sys

def load_templates():
    try:
        with open('message_templates.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: 'message_templates.json' not found.")
        return {}
    except json.JSONDecodeError:
        print("Error: Failed to decode 'message_templates.json'.")
        return {}

def main():
    username = input("Facebook username: ")
    password = getpass("Facebook password: ")
    try:
        client = fbchat.Client(username, password)
    except Exception as e:
        print(f"Failed to login: {e}")
        sys.exit(1)

    templates = load_templates()
    if not templates:
        print("No templates available. Exiting...")
        client.logout()
        sys.exit(1)

    print("Available templates:")
    template_list = list(templates.keys())
    for i, template_name in enumerate(template_list):
        print(f"{i+1}. {template_name}")

    try:
        choice = int(input("Choose a template number: ")) - 1
        if choice < 0 or choice >= len(template_list):
            raise ValueError("Choice out of range.")
    except ValueError as e:
        print(f"Invalid choice: {e}")
        client.logout()
        sys.exit(1)

    template_name = template_list[choice]
    template = templates[template_name]

    friend_name = input("Friend's name: ")
    try:
        friends = client.searchForUsers(friend_name)
        if not friends:
            print(f"Error: No friends found with name '{friend_name}'")
            client.logout()
            sys.exit(1)

        friend = friends[0]

        # Fill in template placeholders
        # We work on a copy to avoid modifying the original templates dict
        filled_template = {}
        for key, value in template.items():
            if '{' in value:
                filled_template[key] = value.format(
                    name=friend.name,
                    custom_input=input(f"Enter {key}: ")
                )
            else:
                filled_template[key] = value

        message = "\n".join(filled_template.values())
        sent = client.sendMessage(message, thread_id=friend.uid)

        if sent:
            print("Message sent successfully!")
        else:
            print("Failed to send message.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        client.logout()

if __name__ == "__main__":
    main()
