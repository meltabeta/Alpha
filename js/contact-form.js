import { database } from './firebase-config.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  const textarea = form.querySelector('textarea');
  const characterCount = form.querySelector('.character-count');
  const submitButton = form.querySelector('button[type="submit"]');

  // Character count
  textarea?.addEventListener('input', () => {
    const remaining = textarea.value.length;
    characterCount.textContent = `${remaining}/500`;
  });

  // Form validation
  form?.addEventListener('input', () => {
    const isValid = form.checkValidity() && form.querySelector('input[type="checkbox"]').checked;
    if (submitButton) {
      submitButton.disabled = !isValid;
    }
  });

  // Form submission
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="loading">Sending...</span>';
    }

    try {
      const formData = {
        requestType: form.querySelector('select').value,
        firstName: form.querySelector('input[placeholder="First Name"]').value,
        lastName: form.querySelector('input[placeholder="Last Name"]').value,
        email: form.querySelector('input[placeholder="Email Address"]').value,
        phone: form.querySelector('input[placeholder="Phone (Optional)"]').value,
        message: form.querySelector('textarea').value,
        timestamp: new Date().toISOString(),
        status: 'new'
      };

      // Create a unique ID for the submission
      const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save to Firebase
      await set(ref(database, `contact_submissions/${submissionId}`), formData);

      // Show success message
      showNotification('Message sent successfully!', 'success');
      form.reset();

    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('Failed to send message. Please try again.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send Message';
      }
    }
  });
});

function showNotification(message, type) {
  // Remove any existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create new notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add styles for positioning
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '15px 25px';
  notification.style.borderRadius = '8px';
  notification.style.backgroundColor = type === 'success' ? '#00cc66' : '#ff4444';
  notification.style.color = '#fff';
  notification.style.zIndex = '1000';
  notification.style.transform = 'translateY(100px)';
  notification.style.transition = 'all 0.3s ease';
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.transform = 'translateY(0)';
  }, 100);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateY(100px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
