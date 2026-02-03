from enum import Enum


class LogCategory(str, Enum):
    AUTH = "auth"
    ORG = "org"
    PROFILE = "profile"
    BILLING = "billing"
    JOURNEY = "journey"
    SYSTEM = "system"
    COMPLIANCE = "compliance"
