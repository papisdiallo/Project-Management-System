import random
import string
from .models import Invitation
from django.conf import settings
from django.core.mail import send_mail

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


def send_emailConfirmation_code(email_to, username, code):
    # this content need to be an html content
    content = f"Hi {username},\n Thank you for signing up on our site.\n Your verification code is: {code}"
    subject = "Email Verification"
    from_email = settings.EMAIL_HOST_USER
    send_mail(subject, content, from_email, [email_to, ], fail_silently=False)
