from django.db.models.signals import post_save
from .utils import generate_random_26_string, generate_unique_slug
from django.dispatch import receiver

from .models import User, Invitation, Profile


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profiles.objects.create(
            user=instance, profile_background=random.choice(list(colorPickerList))
        )
        
@receiver(post_save, sender=Invitation)
def create_unique_invitation_slug(sender, instance, create, **kwargs):
    if created:
        new_slug = generate_unique_slug(instance)
        instance.slug = new_slug
        instance.save()





