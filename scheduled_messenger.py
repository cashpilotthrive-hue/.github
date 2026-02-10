import fbchat
from getpass import getpass
import schedule
import time
import sys

def send_scheduled_message(client, friend_name, message):
    try:
        friends = client.searchForUsers(friend_name)
        if not friends:
            print(f"Error: No friends found with name '{friend_name}'")
            return

        friend = friends[0]
        sent = client.sendMessage(message, thread_id=friend.uid)
        if sent:
            print(f"Scheduled message sent to {friend.name}")
    except Exception as e:
        print(f"Failed to send scheduled message: {e}")

def main():
    username = input("Facebook username: ")
    password = getpass("Facebook password: ")
    try:
        client = fbchat.Client(username, password)
    except Exception as e:
        print(f"Failed to login: {e}")
        sys.exit(1)

    friend_name = input("Friend's name: ")
    message = input("Enter your message: ")
    schedule_time = input("Enter time to send (HH:MM): ")

    schedule.every().day.at(schedule_time).do(
        send_scheduled_message, client, friend_name, message
    )

    print(f"Successfully scheduled message for {friend_name} at {schedule_time} daily.")
    print("Keep this script running to send the message.")

    while True:
        try:
            schedule.run_pending()
            time.sleep(1)
        except KeyboardInterrupt:
            print("\nExiting...")
            client.logout()
            break
        except Exception as e:
            print(f"Error during execution: {e}")
            time.sleep(60)

if __name__ == "__main__":
    main()
