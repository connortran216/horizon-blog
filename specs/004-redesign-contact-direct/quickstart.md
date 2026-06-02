# Quickstart: Redesign Contact Direct

## Review Scenario

1. Open `/contact`.
2. Confirm the first viewport presents a direct email action.
3. Confirm phone and location are visible as secondary contact details.
4. Confirm there are no form fields for name, email, subject, or message.
5. Confirm there is no submit button, fake loading behavior, or success/error toast tied to contact submission.
6. Resize to a mobile viewport and confirm contact details and prompts stack without overlap.

## Static Validation

```sh
rg -n "useState|useToast|handleSubmit|setTimeout|FormControl|Input|Textarea|Send message|Message sent|Failed to send" src/features/contact
rtk yarn lint
```
