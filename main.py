import fbchat
from getpass import getpass
import schedule
import time
import json
import sys
import threading

# Shared state for scheduler
_scheduler_lock = threading.Lock()
_scheduler_thread = None

def load_templates(filepath='message_templates.json'):
    """Load message templates from a JSON file."""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: {filepath} not found.")
        return {}
    except json.JSONDecodeError:
        print(f"Error: Failed to decode JSON from {filepath}.")
        return {}

def send_scheduled_message(client, friend_name, message):
    """Function called by the scheduler to send a message."""
    try:
        print(f"\n[Scheduled Task] Attempting to send message to {friend_name}...")
        # Since client might be used in different threads, we should be careful.
        # But fbchat.Client is generally not thread-safe for concurrent requests.
        # Here it's mostly sequential or low frequency.
        friends = client.searchForUsers(friend_name)
        if not friends:
            print(f"Error: Friend '{friend_name}' not found.")
            return
        friend = friends[0]
        sent = client.sendMessage(message, thread_id=friend.uid)
        if sent:
            print(f"Successfully sent scheduled message to {friend.name}")
        else:
            print(f"Failed to send scheduled message to {friend.name}")
    except Exception as e:
        print(f"Error occurred during scheduled message delivery: {e}")

def _run_scheduler_loop():
    """Background loop to run pending scheduled tasks."""
    while True:
        with _scheduler_lock:
            schedule.run_pending()
        time.sleep(1)

def main():
    """Main function to run the Facebook Messenger Bot."""
    global _scheduler_thread

    print("--- Facebook Messenger Bot ---")
    username = input("Facebook username: ")
    password = getpass("Facebook password: ")

    try:
        # Note: Depending on your account settings, you might need a session cookie instead.
        client = fbchat.Client(username, password)
    except Exception as e:
        print(f"Failed to login: {e}")
        return

    if not client.isLoggedIn():
        print("Login failed. Please check your credentials.")
        return

    while True:
        print("\n--- Menu ---")
        print("1. Send a simple message")
        print("2. Send a template-based message")
        print("3. Schedule a daily message")
        print("4. View/Clear scheduled tasks")
        print("5. Exit")

        choice = input("Choose an option: ")

        if choice == '1':
            friend_name = input("Friend's name: ")
            message = input("Enter your message: ")
            try:
                friends = client.searchForUsers(friend_name)
                if friends:
                    friend = friends[0]
                    if client.sendMessage(message, thread_id=friend.uid):
                        print(f"Message sent successfully to {friend.name}!")
                    else:
                        print("Failed to send message.")
                else:
                    print(f"Friend '{friend_name}' not found.")
            except Exception as e:
                print(f"An error occurred: {e}")

        elif choice == '2':
            templates = load_templates()
            if not templates:
                print("No templates available. Please create message_templates.json.")
                continue

            print("\nAvailable templates:")
            template_names = list(templates.keys())
            for i, name in enumerate(template_names):
                print(f"{i+1}. {name}")

            try:
                t_input = input("Choose a template number (or 'q' to go back): ")
                if t_input.lower() == 'q':
                    continue

                t_choice = int(t_input) - 1
                if 0 <= t_choice < len(template_names):
                    template_name = template_names[t_choice]
                    template = templates[template_name]

                    friend_name = input("Friend's name: ")
                    friends = client.searchForUsers(friend_name)
                    if friends:
                        friend = friends[0]

                        # Fill in template placeholders
                        final_message_parts = []
                        for key, value in template.items():
                            if isinstance(value, str) and '{' in value:
                                try:
                                    formatted_value = value.format(
                                        name=friend.name,
                                        custom_input=input(f"Enter value for {key}: ")
                                    )
                                    final_message_parts.append(formatted_value)
                                except KeyError as e:
                                    print(f"Warning: Missing placeholder variable {e}. Using original text.")
                                    final_message_parts.append(value)
                            else:
                                final_message_parts.append(str(value))

                        message = "\n".join(final_message_parts)
                        if client.sendMessage(message, thread_id=friend.uid):
                            print(f"Template message sent successfully to {friend.name}!")
                        else:
                            print("Failed to send template message.")
                    else:
                        print(f"Friend '{friend_name}' not found.")
                else:
                    print("Invalid choice.")
            except ValueError:
                print("Please enter a valid number.")
            except Exception as e:
                print(f"An error occurred: {e}")

        elif choice == '3':
            friend_name = input("Friend's name: ")
            message = input("Enter your message: ")
            schedule_time = input("Enter time to send (HH:MM, 24h format): ")

            try:
                with _scheduler_lock:
                    schedule.every().day.at(schedule_time).do(
                        send_scheduled_message, client, friend_name, message
                    )
                print(f"Message scheduled for {schedule_time} every day.")

                # Start scheduler thread if not already running
                if _scheduler_thread is None or not _scheduler_thread.is_alive():
                    _scheduler_thread = threading.Thread(target=_run_scheduler_loop, daemon=True)
                    _scheduler_thread.start()
                    print("Scheduler is running in the background.")
            except Exception as e:
                print(f"Error setting up schedule: {e}")

        elif choice == '4':
            jobs = schedule.get_jobs()
            if not jobs:
                print("No scheduled tasks.")
            else:
                print("\nScheduled Tasks:")
                for i, job in enumerate(jobs):
                    print(f"{i+1}. {job}")

                c = input("Type 'clear' to remove all tasks, or 'back' to return: ")
                if c.lower() == 'clear':
                    with _scheduler_lock:
                        schedule.clear()
                    print("All scheduled tasks cleared.")

        elif choice == '5':
            client.logout()
            print("Logged out. Goodbye!")
            sys.exit()

        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
