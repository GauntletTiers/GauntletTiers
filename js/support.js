document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion is handled in main.js
    
    // Support form submission
    const supportForm = document.getElementById('support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', handleSupportSubmit);
    }
    
    // Subject selector change handler
    const subjectSelect = document.getElementById('support-subject');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', function() {
            const messageArea = document.getElementById('support-message');
            
            // Add placeholder text based on subject
            const placeholders = {
                'tier': 'Please provide your current tier, the tier you believe you should be in, and evidence of recent tournament performances...',
                'tournament': 'Please describe the issue you encountered during the tournament, including date, time, and any error messages...',
                'account': 'Please describe your account issue in detail...',
                'bug': 'Please describe the bug, including steps to reproduce and expected vs actual behavior...',
                'general': 'How can we help you today?',
                'other': 'Please describe your inquiry...'
            };
            
            if (placeholders[this.value]) {
                messageArea.placeholder = placeholders[this.value];
            }
        });
    }
});

function handleSupportSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('support-name').value,
        email: document.getElementById('support-email').value,
        subject: document.getElementById('support-subject').value,
        message: document.getElementById('support-message').value,
        timestamp: new Date().toISOString()
    };
    
    // In production, this would send to a server
    // For now, store in localStorage as "tickets"
    let tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    tickets.push({
        id: 'TKT-' + Date.now(),
        ...formData,
        status: 'open'
    });
    localStorage.setItem('supportTickets', JSON.stringify(tickets));
    
    showNotification('Support ticket submitted successfully! We will respond within 24 hours.', 'success');
    
    // Reset form
    e.target.reset();
    
    // Log to console for admin review (in production, this would be a database)
    console.log('New support ticket:', formData);
}

// Quick action buttons
function quickAction(action) {
    const subjectSelect = document.getElementById('support-subject');
    const messageArea = document.getElementById('support-message');
    
    switch(action) {
        case 'tier-appeal':
            if (subjectSelect) subjectSelect.value = 'tier';
            if (messageArea) {
                messageArea.placeholder = 'Please provide your current tier, desired tier, and evidence...';
                messageArea.focus();
            }
            document.getElementById('support-subject')?.scrollIntoView({ behavior: 'smooth' });
            break;
            
        case 'report-bug':
            if (subjectSelect) subjectSelect.value = 'bug';
            if (messageArea) {
                messageArea.placeholder = 'Please describe the bug in detail...';
                messageArea.focus();
            }
            document.getElementById('support-subject')?.scrollIntoView({ behavior: 'smooth' });
            break;
            
        case 'account-issue':
            if (subjectSelect) subjectSelect.value = 'account';
            if (messageArea) {
                messageArea.placeholder = 'Please describe your account issue...';
                messageArea.focus();
            }
            document.getElementById('support-subject')?.scrollIntoView({ behavior: 'smooth' });
            break;
    }
}

// Ticket status checker (for logged in users)
function checkTicketStatus() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        showNotification('Please log in to view your tickets', 'error');
        return;
    }
    
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    const userTickets = tickets.filter(t => t.email === userEmail);
    
    if (userTickets.length === 0) {
        showNotification('You have no support tickets', 'info');
    } else {
        const openTickets = userTickets.filter(t => t.status === 'open').length;
        showNotification(`You have ${openTickets} open ticket(s)`, 'info');
    }
}