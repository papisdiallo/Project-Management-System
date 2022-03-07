from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from .models import Site, Project
from django.conf import settings
from accounts.models import Invitation
from accounts.forms import InviteForm, inviteHelper
from django.urls import reverse
from .forms import CreateSiteForm, CreateProjectForm
from django.forms import modelformset_factory
from django.contrib import messages
from accounts.utils import EmailThreading, allowedToEnterProject, allowedToEditProject
from django.template.loader import get_template
from django.core.mail import send_mail, EmailMessage
from django.template.context_processors import csrf
from crispy_forms.utils import render_crispy_form
from django.template.loader import render_to_string


@login_required
def create_site(request):
    form = CreateSiteForm(request.POST or None)
    if form.is_valid():
        if request.user.is_site_administrator == False:
            request.user.is_site_administrator = True
            request.user.save()
            form.save(commit=False)
            form.instance.admin = request.user
            form.save()
            # assign the user's site or company
            request.user.profile.site = form.instance
            request.user.profile.save()
            return redirect(
                reverse("dashbaord", kwargs={"site_slug": form.instance.slug})
            )
        else:
            site = Site.objects.get(admin=request.user)
            messages.error(
                request,
                f"You are already the administrator of the site {site}. You cannot be the administrator of two sites!",
            )
    context = {
        "form": form,
    }
    return render(request, "tracker/create_site.html", context)


class DashbaordView(LoginRequiredMixin, View):
    def get(self, request, site_slug, *args, **kwargs):
        user = request.user
        # need to get the site and check ifthe user is in the people of course
        user_projects = user.get_projects()
        site_slug = user.profile.site.slug
        context = {'projects': user_projects, 'site_slug': site_slug}
        return render(request, 'tracker/dashboard.html', context)

    def post(self, request, site_slug, *args, **kwargs):
        formset = invitationFormset(request.POST)
        return render(request, 'tracker/dashboard.html', context)


def inviteMembers(request):
    queryset = Invitation.objects.none()
    formset_factory = modelformset_factory(
        Invitation, fields=('guest', 'role'), form=InviteForm, extra=3)
    formset = formset_factory(request.POST or None, queryset=queryset)
    domain = request.META['HTTP_HOST']
    context_data = {'domain': domain}
    if formset.is_valid():
        recipient_list = []
        for form in formset:
            email = form.cleaned_data.get("guest", None)
            if email != None:
                form.save(commit=False)
                form.instance.inviter = request.user
                form.save()
                recipient_list.append(email)
                url = f'{domain}/accounts/register/?invitation_refid={form.instance.slug}/'
                context_data['url'] = url
                context_data['role'] = form.instance.role
                context_data['site'] = form.instance.inviter.profile.site.site_name
                context_data['inviter'] = form.instance.inviter.username
                context_data['project'] = "New Project"

                # let's send the emails to the differents users
                message_template = get_template(
                    'accounts/emailMessageTemplate.html').render(context_data)
                subject = f"Invitation from {form.instance.inviter.profile.site.site_name}"
                from_email = settings.EMAIL_HOST_USER
                email = EmailMessage(
                    subject, message_template, from_email, [email, ]
                )
                # this is what allows you to send the email as html and not a plain text(this is super important)
                email.content_subtype = 'html'
                EmailThreading(email).start()
        return JsonResponse({"success": True})
    return JsonResponse({"success": False})


@login_required
def createProject(request, site_slug):
    form = CreateProjectForm(request.POST or None, request=request)
    form_data = {}
    if form.is_valid():
        form.save(commit=False)
        site = request.user.profile.site
        form.instance.project_site = site
        form.save()
        form_data = form.cleaned_data
        form_data["result"] = True
        return JsonResponse(form_data)
    else:
        form_data["result"] = False
        context = csrf(request)
        formWithErrors = render_crispy_form(form, context=context)
        form_data["formErrors"] = formWithErrors
        return JsonResponse(form_data)
    return JsonResponse({"error": "error"})


class ProjectDetailView(LoginRequiredMixin, View):

    def get(self, request, site_slug, project_key, *args, **kwargs):
        user = request.user
        site_slug = user.profile.site.slug
        project = get_object_or_404(Project, key=project_key)
        form = CreateProjectForm(instance=project)
        activeProjectBg = project.project_theme.split(' ')[0]
        navbarBg = project.project_theme.split(' ')[1]
        members = project.members.all()
        print(members)
        context = {
            'site_slug': site_slug, 'project': project,
            'form': form, 'project_icon': project.project_icon,
            'project_color': project.project_color,
            'activeProjectBg': activeProjectBg,
            'activeNav': navbarBg, 'members': members, }
        return render(request, 'tracker/project_details.html', context)


@ login_required
@allowedToEnterProject
@allowedToEditProject
def edit_project_name_and_key(request, site_slug, project_key):
    project = get_object_or_404(Project, key=project_key)
    result = {}
    if request.method == "POST":
        form = CreateProjectForm(
            request.POST, request=request, instance=project)
        if form.is_valid():
            print("the form is valid ")
            if form.has_changed():
                print("the form has changed somewhere")
                result["result"] = True
                field_name = form.changed_data[0]
                print(field_name)
                field_obj = Project._meta.get_field(field_name)
                field_value = field_obj.value_from_object(project)
                result["name"] = field_name
                result["value"] = field_value
                print(field_value)
                form.save()
                result['not_valid'] = False
            return JsonResponse(result)

        else:
            result["response"] = False
            result['not_valid'] = True
            context = csrf(request)
            formWithErrors = render_crispy_form(form, context=context)
            result["formErrors"] = formWithErrors
            return JsonResponse(result)
    # this view should only be called in a fetch or ajax request with post method
    return JsonResponse({'error': 'Something went wrong. PLease Try again'})
