import random
import threading
import string
from .models import Invitation
from django.conf import settings
from django.core.mail import send_mail, EmailMessage
from tracker.models import Site
from django.template.loader import get_template


colorPickerList = {
    "#2596be",
    "#32a852",
    "#067568",
    "#8c1207",
    "#020452",
    "#320845",
    "#343a40",
    "#b00443",
    "#fd5656",
    "#080817",
}
# this function will create a random 26 string


def generate_random_26_string():
    all_letters = "".join(
        string.digits + string.ascii_lowercase + string.ascii_uppercase)
    return "".join([random.choice(all_letters) for _ in range(26)])


def generate_unique_slug(instance, new_slug=None):
    klass = instance.__class__
    if new_slug != None:
        slug = new_slug
    else:
        slug = generate_random_26_string()
    if klass.objects.filter(slug=slug).exists():
        slug = generate_random_26_string()
        return generate_unique_slug(instance, new_slug=slug)
    print("this is the slug from the utils ", slug)
    return slug


class EmailThreading(threading.Thread):
    def __init__(self, email):
        self.email = email
        threading.Thread.__init__(self)

    def run(self):
        self.email.send(fail_silently=False)


def send_emailConfirmation_code(email_to, username, code):
    # this content need to be an html
    context_data = {'code': code}
    message_template = get_template(
        'accounts/emailMessageTemplate.html').render(context_data)
    content = f"Hi {username},\n Thank you for signing up on our site.\n Your verification code is: {code}"
    subject = "Email Verification"
    from_email = settings.EMAIL_HOST_USER
    email = EmailMessage(
        subject, message_template, from_email, [email_to, ]
    )
    # this is what allows you to send the email as html and not a plain text(this is super important)
    email.content_subtype = 'html'
    EmailThreading(email).start()
