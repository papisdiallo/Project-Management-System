import random
import threading
import string
from .models import Invitation
from django.conf import settings
from django.core.mail import send_mail, EmailMessage
from tracker.models import Site, Project
from django.template.loader import get_template
from django.urls import reverse
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages

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
    return slug


class EmailThreading(threading.Thread):
    def __init__(self, email):
        self.email = email
        threading.Thread.__init__(self)

    def run(self):
        self.email.send(fail_silently=False)


def send_emailConfirmation_code(email_to, username, code):
    # this content need to be an html
    context_data = {'code': code, 'username': username}
    message_template = get_template(
        'accounts/email_code_confirmation.html').render(context_data)
    content = f"Hi {username},\n Thank you for signing up on our site.\n Your verification code is: {code}"
    subject = "Email Verification"
    from_email = settings.EMAIL_HOST_USER
    email = EmailMessage(
        subject, message_template, from_email, [email_to, ]
    )
    # this is what allows you to send the email as html and not a plain text(this is super important)
    email.content_subtype = 'html'
    EmailThreading(email).start()


def is_ajax(request):
    return request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'


def get_first_and_last_name(string):
    first_name, last_name = "", ""
    _list = string.split(" ")
    if len(_list) > 2:
        first_name = _list[0]
        last_name = " ".join(_list[1:])
        return (first_name, last_name)
    else:
        first_name, last_name = (_list[0], _list[1])
        return (first_name, last_name)


# this function is a decorator to check if the user is admin or project manager
# before letting him perform certain actions

def allowedToEnterProject(func_view):
    def wrapper_func(request, site_slug, project_key, *args, **kwargs):
        user = request.user
        site_slug = user.profile.site.slug
        project = get_object_or_404(Project, key=project_key)
        if project not in user.get_projects():
            messages.error(
                request, "Sorry! but you are not allowed to get into this project.")
            return redirect(
                reverse("dashbaord", kwargs={"site_slug": site_slug})
            )
        else:
            return func_view(request, site_slug, project_key, *args, **kwargs)
    return wrapper_func


def allowedToEditProject(func_view):
    def wrapper_func(request, site_slug, project_key, *args, **kwargs):
        user = request.user
        site_slug = user.profile.site.slug
        project = get_object_or_404(Project, key=project_key)
        if project.manager != user and not user.is_site_administrator:
            messages.error(
                request, "Sorry! but you are not allowed to make changes  in this project.")
            return redirect(
                reverse("edit_project_details", kwargs={
                        "site_slug": site_slug, 'project_key': project.key})
            )
        else:
            return func_view(request, site_slug, project_key, *args, **kwargs)
    return wrapper_func
