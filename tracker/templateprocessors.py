from django.forms import modelformset_factory
from accounts.forms import InviteForm, inviteHelper
from accounts.models import Invitation


def get_universalForms(request, *args, **kwargs):
    helper = inviteHelper()
    formset = modelformset_factory(
        Invitation, fields=('guest', 'role',), form=InviteForm, extra=3)

    formsDict = {"formset": formset, 'helper': helper, }

    return formsDict
