# Betting Platform - Social User-Facing Workflows

This project implements the social-user-facing workflows for a betting platform, following regulatory requirements and high-performance standards.

## Architecture
The platform is built using an event-driven microservices architecture.

### Services
- **Support Service** (`services/support_service`): Manages support tickets and complaints.
- **GDPR Service** (`services/gdpr_service`): Handles data-subject requests (export, deletion, etc.).
- **Notification Service**: Sends emails and SMS notifications.
- **Audit Log Service**: Maintains an immutable audit trail.
- **API Gateway**: Entry point for all client requests.

## Documentation
- [API Specification](docs/api/openapi.yaml)
- [Product Kit](docs/kit/)
- [Architecture Diagrams](diagrams/)

## Getting Started
Each service is located in the `services/` directory and can be run independently.
For development, we use FastAPI for services and pytest for testing.
