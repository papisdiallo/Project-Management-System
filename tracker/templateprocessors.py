from django.forms import modelformset_factory
from accounts.forms import InviteForm, inviteHelper
from accounts.models import Invitation


def get_universalForms(request, *args, **kwargs):
    url_end = (request.get_full_path()).split("/")[-2]
    queryset = Invitation.objects.none()
    dashboard_page = False
    if url_end == 'dashboard':
        dashboard_page = True
    helper = inviteHelper()
    formset_factory = modelformset_factory(
        Invitation, fields=('guest', 'role',), form=InviteForm, extra=3)
    formset = formset_factory(request.POST or None, queryset=queryset)
    formsDict = {"formset": formset, 'helper': helper,
                 'dashboard_page': dashboard_page, }

    return formsDict
