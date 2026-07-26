from dataclasses import dataclass

@dataclass
class AgentResponse:
    agent: str
    answer: str
    recommendations: list[str]

class BaseAgent:
    name = "base"
    def respond(self, message: str, context: dict) -> AgentResponse:
        return AgentResponse(self.name, "I can help with your economic growth plan.", [])

class FinancialCoachAgent(BaseAgent):
    name = "financial_coach"
    def respond(self, message: str, context: dict) -> AgentResponse:
        return AgentResponse(self.name, "Track essentials first, cap flexible spending, and automate savings before discretionary purchases.", ["Create a 30-day budget", "Build a $500 starter emergency fund", "Review subscriptions"])

class LearningAgent(BaseAgent):
    name = "learning"
    def respond(self, message: str, context: dict) -> AgentResponse:
        return AgentResponse(self.name, "Your next path should combine one income skill, one digital tool, and one portfolio project.", ["Start Budgeting Foundations", "Complete a portfolio task", "Study 25 minutes daily"])

class CareerAgent(BaseAgent):
    name = "career"
    def respond(self, message: str, context: dict) -> AgentResponse:
        return AgentResponse(self.name, "Match your strongest skills to remote projects first, then build evidence for higher-value roles.", ["Update skill profile", "Apply to 3 matched roles", "Prepare a concise pitch"])

class BusinessAgent(BaseAgent):
    name = "business"
    def respond(self, message: str, context: dict) -> AgentResponse:
        return AgentResponse(self.name, "Validate a micro-business with pre-orders, a one-page offer, and weekly unit economics tracking.", ["Interview 5 customers", "Estimate margin", "Launch a landing page"])

class ResearchAgent(BaseAgent):
    name = "research"
    def respond(self, message: str, context: dict) -> AgentResponse:
        return AgentResponse(self.name, "Focus research on demand, competition, regulation, and distribution before investing time or money.", ["Summarize market size", "List competitors", "Find entry constraints"])

class AIOrchestrator:
    def __init__(self):
        self.agents = {a.name: a for a in [FinancialCoachAgent(), LearningAgent(), CareerAgent(), BusinessAgent(), ResearchAgent()]}
    def route(self, agent: str, message: str, context: dict | None = None) -> AgentResponse:
        selected = self.agents.get(agent, self.agents["financial_coach"])
        return selected.respond(message, context or {})
