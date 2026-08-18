from django import forms
from .models import Thread, Reply

from django import forms
from .models import Thread

class ThreadForm(forms.ModelForm):
    message = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 6}),
        label="Your first post"
    )

    class Meta:
        model = Thread
        fields = ['author_name', 'title', 'message']



class ReplyForm(forms.ModelForm):
    class Meta:
        model = Reply
        fields = ['author_name', 'message']
        widgets = {
            'author_name': forms.TextInput(attrs={'placeholder': 'Your name'}),
            'message': forms.Textarea(attrs={'placeholder': 'Write your reply...'}),
        }
