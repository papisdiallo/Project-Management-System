from django.forms import modelformset_factory

from accounts.models import Invitation


def get_universalForms(request):
    invitaionFormSet = modelformset_factory(
        Invitation, fields=('guest',), extra=3)
    formsDict = {"invitationFormset": invitaionFormSet, }
    return formsDict
