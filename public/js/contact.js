document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = 'Gönderiliyor...';

    try {
        const formData = {
            name: e.target.name.value,
            email: e.target.email.value,
            subject: e.target.subject.value,
            message: e.target.message.value
        };

        const response = await fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.status === 429) {
            showNotification('error', 'Limit Aşıldı', 
                'Çok fazla deneme yaptınız. Lütfen bir süre bekleyip tekrar deneyin.');
            return;
        }

        if (response.ok) {
            showNotification('success', 'Başarılı!', 'Mesajınız başarıyla gönderildi.');
            e.target.reset();
        } else {
            showNotification('error', 'Hata!', data.error);
            
            if (data.fields) {
                Object.entries(data.fields).forEach(([field, error]) => {
                    if (error) {
                        highlightErrorField(field, error);
                    }
                });
            }
        }
    } catch (error) {
        showNotification('error', 'Bağlantı Hatası', 'Lütfen internet bağlantınızı kontrol edin');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

function showNotification(type, title, message) {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <button class="notification-close">&times;</button>
        <div class="notification-title">${title}</div>
        <p class="notification-message">${message}</p>
    `;

    container.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    setTimeout(() => removeNotification(notification), 5000);
}

function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
}

function highlightErrorField(fieldName, error) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        field.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = error;
        field.parentNode.appendChild(errorDiv);
        
        field.addEventListener('input', () => {
            field.classList.remove('is-invalid');
            errorDiv.remove();
        });
    }
} 