document.addEventListener('DOMContentLoaded', function () {
    const testTextEl = document.getElementById('test-text');
    const typingArea = document.getElementById('typing-area');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const wpmEl = document.getElementById('wpm');
    const accuracyEl = document.getElementById('accuracy');
    const timeEl = document.getElementById('time');
    const timerDisplay = document.getElementById('timer');

    let startTime, interval, originalText = '', secondsPassed = 0;

    // Helper: Start Timer
    function startTimer() {
        secondsPassed = 0;
        timerDisplay.textContent = 'Time: 0 seconds';
        interval = setInterval(() => {
            secondsPassed++;
            timerDisplay.textContent = `Time: ${secondsPassed} second${secondsPassed !== 1 ? 's' : ''}`;
        }, 1000);
    }

    // Helper: Stop Timer
    function stopTimer() {
        clearInterval(interval);
    }

    // Start Test
    startButton.addEventListener('click', async function () {
        startButton.disabled = true;

        const response = await fetch('/get_text');
        const data = await response.json();
        originalText = data.text;

        testTextEl.textContent = originalText;
        typingArea.disabled = false;
        typingArea.value = '';
        typingArea.focus();
        startTime = new Date().toISOString().replace('Z', '');
        resetButton.style.display = 'inline-block';
        startTimer();
    });

    // Reset Test
    resetButton.addEventListener('click', function () {
        stopTimer();
        testTextEl.textContent = '';
        typingArea.disabled = true;
        typingArea.value = '';
        startButton.disabled = false;
        resetButton.style.display = 'none';
        wpmEl.textContent = '0';
        accuracyEl.textContent = '0';
        timeEl.textContent = '0';
        timerDisplay.textContent = 'Time: 0 seconds';
        typingArea.style.borderColor = '#ddd';
    });

    // On Typing Input
    typingArea.addEventListener('input', function () {
        const typed = typingArea.value;
        const match = originalText.startsWith(typed);
        typingArea.style.borderColor = match ? '#4CAF50' : '#f44336';

        if (typed.length === originalText.length) {
            stopTimer();
            calculateResults();
        }
    });

    // Send Results to Backend
    async function calculateResults() {
        typingArea.disabled = true;

        const response = await fetch('/calculate_wpm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                typed_text: typingArea.value,
                original_text: originalText,
                start_time: startTime
            })
        });

        const results = await response.json();

        wpmEl.textContent = results.wpm;
        accuracyEl.textContent = results.accuracy;
        timeEl.textContent = results.time_taken;
    }
});
