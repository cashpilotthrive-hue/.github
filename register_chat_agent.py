"""Register a chat agent with Agentverse using environment variables.

Usage:
    export AGENTVERSE_KEY="..."
    export AGENT_SEED_PHRASE="..."
    python register_chat_agent.py
"""

import os

from uagents_core.utils.registration import (
    RegistrationRequestCredentials,
    register_chat_agent,
)


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"Missing required environment variable: {name}. "
            "Set it before running this script."
        )
    return value


def main() -> None:
    register_chat_agent(
        "ChatG",
        "https://chatgpt.com/codex/cloud",
        active=True,
        credentials=RegistrationRequestCredentials(
            agentverse_api_key=_required_env("AGENTVERSE_KEY"),
            agent_seed_phrase=_required_env("AGENT_SEED_PHRASE"),
        ),
    )


if __name__ == "__main__":
    main()
