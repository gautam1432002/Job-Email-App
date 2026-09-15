from django import template

register = template.Library()

@register.filter(name='split_paragraphs')
def split_paragraphs(value):
    """
    Splits a string on double newlines into a list of paragraphs.
    Used in email templates to render multi-paragraph AI content correctly.
    """
    if not value:
        return ['']
    paragraphs = [p.strip() for p in str(value).split('\n\n') if p.strip()]
    return paragraphs if paragraphs else [value]
