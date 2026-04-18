from twilio.base.exceptions import TwilioRestException
from twilio.http.http_client import TwilioHttpClient
from twilio.rest import Client

from app.core.config import settings


class AuthService:
    def __init__(self) -> None:
        http_client = TwilioHttpClient()
        # Avoid picking up HTTPS_PROXY / HTTP_PROXY from environment.
        # These can break OTP in some local setups (tunnel 403).
        http_client.session.trust_env = False
        self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token, http_client=http_client)

    def send_otp(self, phone: str) -> str:
        verification = self.client.verify.v2.services(settings.twilio_verify_service_sid).verifications.create(
            to=phone,
            channel="sms",
        )
        return verification.sid

    def verify_otp(self, phone: str, code: str) -> bool:
        try:
            check = self.client.verify.v2.services(settings.twilio_verify_service_sid).verification_checks.create(
                to=phone,
                code=code,
            )
            return check.status == "approved"
        except TwilioRestException:
            return False
