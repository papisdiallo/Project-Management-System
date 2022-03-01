
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth import get_user_model
from .forms import UserRegistrationForm, LoginForm
from .models import ConfirmationCode, Invitation
from .utils import send_emailConfirmation_code
import string
import random


User = get_user_model()


def Login(request):
    form = LoginForm(request.POST or None)
    if form.is_valid():
        username = form.cleaned_data.get("email")
        password = form.cleaned_data.get("password")
        user = authenticate(username=username, password=password)
        print('this is the user from the login page still', user)
        print("this is the user's username from the login view", user.username)
        # check if the user has been sent a code then he is an admin
        user_email_code = ConfirmationCode.objects.get(user=user).exists()
        if user_email_code:
            if user_email_code.is_confirmed:
                return redirect("dashbaord")
            request.session['user_to_verify_id'] = user.id
            return redirect("email_confirmation")

        if "next" in request.POST:
            return redirect(request.POST.get("next"))
        return redirect('dashbaord')
    return render(request, "accounts/login.html", {"form": form})


def register(request):
    form = UserRegistrationForm(request.POST or None)
    invitation_slug = request.GET.get("invitation", None)
    if form.is_valid():
        email = form.cleaned_data.get("email")
        password = form.cleaned_data.get("password1")
        username = form.cleaned_data.get("username")

        instance = form.save(commit=False)
        instance.first_name = form.cleaned_data.get("first_name")
        instance.last_name = form.cleaned_data.get("last_name")
        instance.save()

        user = authenticate(username=email, password=password)

        if invitation_slug != None:  # check invitationn and redirect dashboard
            try:
                invitation = Invitation.objects.get(slug=invitation_slug)
                invitation.is_confirmed = True
                invitation.save()
                login(request, user)
                return redirect("dashboard")
            except:  # return an error to the user
                pass

        else:  # means we need to send an email confirmation
            code = instance.confirmation_code.code
            print("there is not invitation for this user")
            request.session['user_to_verify_id'] = user.id
            send_emailConfirmation_code(email, username, code)
            messages.info(
                request, "Just verify your email and you are ready to go!")
            return redirect("email_confirmation")
    return render(request, "accounts/register.html", {"form": form})


def email_confirmation(request):
    if request.method == "POST":
        user = None
        if 'user_to_verify_id' in request.session:
            print("we got the user's id in the session")
            user_id = request.session['user_to_verify_id']
            user = User.objects.get(pk=user_id)
            entered_code = request.POST.get("entered_Code")
            print("This is thee entered code", entered_code)
            user_code = user.confirmation_code.code
            if user_code == entered_code:
                user.confirmation_code.is_confirmed = True
                user.confirmation_code.save()
                # delete the user _id from the session
                del request.session['user_to_verify_id']
                request.session.modified = True
                login(request, user)
                messages.success(
                    request, f"Successfully logged in as {user.username}")
                return redirect("site_creation")
            else:
                messages.error(
                    request, "OOPS! it's seems like the code entered is not correct...")
                return redirect('email_confirmation')
        else:
            print("You should tell the user something ")
    context = {}
    return render(request, 'accounts\email_confirmation.html', context)
