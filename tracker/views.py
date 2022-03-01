from django.shortcuts import render


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
            form.instance.people.add(request.user)
            return redirect(
                reverse("projects", kwargs={"slug_site": form.instance.slug})
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
    return render(request, "tracker/create-site.html", context)
