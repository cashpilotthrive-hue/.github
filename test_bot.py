import unittest
from unittest.mock import MagicMock, patch
import json
import os
from main import load_templates, send_scheduled_message

class TestFacebookBot(unittest.TestCase):
    def test_load_templates_success(self):
        # Create a temporary template file
        test_templates = {"Test": {"key": "value"}}
        with open('test_templates.json', 'w') as f:
            json.dump(test_templates, f)

        loaded = load_templates('test_templates.json')
        self.assertEqual(loaded, test_templates)

        # Cleanup
        os.remove('test_templates.json')

    def test_load_templates_not_found(self):
        loaded = load_templates('non_existent.json')
        self.assertEqual(loaded, {})

    def test_send_scheduled_message_success(self):
        mock_client = MagicMock()
        mock_friend = MagicMock()
        mock_friend.uid = "123"
        mock_friend.name = "John Doe"
        mock_client.searchForUsers.return_value = [mock_friend]
        mock_client.sendMessage.return_value = True

        with patch('builtins.print') as mock_print:
            send_scheduled_message(mock_client, "John Doe", "Hello")
            mock_client.sendMessage.assert_called_with("Hello", thread_id="123")
            # Using any_call because there are other prints
            mock_print.assert_any_call("Successfully sent scheduled message to John Doe")

    def test_send_scheduled_message_friend_not_found(self):
        mock_client = MagicMock()
        mock_client.searchForUsers.return_value = []

        with patch('builtins.print') as mock_print:
            send_scheduled_message(mock_client, "Nobody", "Hello")
            mock_client.sendMessage.assert_not_called()
            mock_print.assert_any_call("Error: Friend 'Nobody' not found.")

if __name__ == '__main__':
    unittest.main()
