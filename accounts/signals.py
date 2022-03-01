from django.db.models.signals import post_save
from .utils import generate_random_26_string, generate_unique_slug
from django.dispatch import receiver
import random
from .models import User, Invitation, Profile, ConfirmationCode
from .utils import colorPickerList
import string


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(
            user=instance, profile_background=random.choice(
                list(colorPickerList))
        )
        confirmation_code = "".join(random.choice(
            "".join(string.digits)) for _ in range(6))
        print("this is thee confirmation code", confirmation_code)
        ConfirmationCode.objects.create(
            user=instance, code=confirmation_code)


@receiver(post_save, sender=Invitation)
def create_unique_invitation_slug(sender, instance, create, **kwargs):
    if created:
        new_slug = generate_unique_slug(instance)
        instance.slug = new_slug
        instance.save()
