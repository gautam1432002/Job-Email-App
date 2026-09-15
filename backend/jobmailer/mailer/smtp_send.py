import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication


def send_job_email(
    receiver_email: str,
    subject: str,
    html_body: str,
    sender_gmail: str,
    app_password: str,
    resume_path: str = None
) -> tuple[bool, str]:
    """
    Send an HTML email via Gmail SMTP with optional PDF attachment.

    Returns:
        (True, 'success message') on success
        (False, 'AUTH_ERROR') on authentication failure — UI shows specific hint
        (False, 'error description') on other failures
    """
    if not sender_gmail or not app_password:
        return False, 'Gmail address or App Password not configured. Go to Settings.'

    try:
        msg = MIMEMultipart('mixed')
        msg['From']    = sender_gmail
        msg['To']      = receiver_email
        msg['Subject'] = subject
        msg['Reply-To'] = sender_gmail

        msg.attach(MIMEText(html_body, 'html', 'utf-8'))

        # Attach resume PDF if path provided and file exists
        if resume_path and os.path.exists(resume_path):
            filename = os.path.basename(resume_path)
            with open(resume_path, 'rb') as f:
                attachment = MIMEApplication(f.read(), _subtype='pdf')
            attachment.add_header(
                'Content-Disposition', 'attachment', filename=filename
            )
            msg.attach(attachment)

        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(sender_gmail, app_password)
            smtp.sendmail(sender_gmail, receiver_email, msg.as_string())

        return True, f'Email sent successfully to {receiver_email}'

    except smtplib.SMTPAuthenticationError:
        return False, 'AUTH_ERROR'
    except smtplib.SMTPRecipientsRefused:
        return False, f'Recipient address {receiver_email} was rejected.'
    except smtplib.SMTPException as e:
        return False, f'SMTP error: {str(e)}'
    except Exception as e:
        return False, f'Unexpected error: {str(e)}'
