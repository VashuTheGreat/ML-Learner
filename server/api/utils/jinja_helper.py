from jinja2 import Template

def render_html(template_str, temp_data):
    template = Template(template_str)
    return template.render(data=temp_data)
