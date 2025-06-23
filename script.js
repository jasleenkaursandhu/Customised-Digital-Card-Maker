// Get the canvas and drawing context
const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');

// Keep track of text elements and drag state
let textElements = [];
let selectedText = null;
let isDragging = false;
let draggedText = null;
let dragOffset = { x: 0, y: 0 };
let isPlacingText = false;
let pendingText = null;

// Function to add text (now prepares text for placement)
function addText() {
    const textInput = document.getElementById('textInput');
    const textColor = document.getElementById('textColor').value;
    const text = textInput.value.trim();
    
    if (text === '') {
        alert('Please enter some text!');
        return;
    }

    // Prepare text for placement
    pendingText = {
        text: text,
        color: textColor,
        size: 20
    };
    
    isPlacingText = true;
    canvas.style.cursor = 'crosshair';
    
    // Clear input
    textInput.value = '';
    
    alert('Now click anywhere on the canvas to place your text!');
}

// Function to get text dimensions (approximate)
function getTextDimensions(textObj) {
    ctx.font = `${textObj.size}px Arial`;
    const metrics = ctx.measureText(textObj.text);
    return {
        width: metrics.width,
        height: textObj.size
    };
}

// Function to check if a point is inside a text element
function getTextAtPosition(x, y) {
    // Check from top to bottom (last drawn = on top)
    for (let i = textElements.length - 1; i >= 0; i--) {
        const textObj = textElements[i];
        const dimensions = getTextDimensions(textObj);
        
        // Check if click is within text bounds
        if (x >= textObj.x && 
            x <= textObj.x + dimensions.width &&
            y >= textObj.y - dimensions.height && 
            y <= textObj.y) {
            return textObj;
        }
    }
    return null;
}

// Mouse down event - start dragging or place text
canvas.addEventListener('mousedown', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // If we're placing new text
    if (isPlacingText && pendingText) {
        const textObj = {
            text: pendingText.text,
            x: mouseX,
            y: mouseY,
            color: pendingText.color,
            size: pendingText.size
        };
        
        textElements.push(textObj);
        pendingText = null;
        isPlacingText = false;
        canvas.style.cursor = 'default';
        drawCard();
        return;
    }
    
    // Check if we clicked on existing text
    const clickedText = getTextAtPosition(mouseX, mouseY);
    
    if (clickedText) {
        // SELECT the text (this was missing!)
        selectedText = clickedText;
        
        // Prepare for dragging
        isDragging = true;
        draggedText = clickedText;
        
        // Calculate offset so text doesn't jump to mouse position
        dragOffset.x = mouseX - clickedText.x;
        dragOffset.y = mouseY - clickedText.y;
        
        canvas.style.cursor = 'grabbing';
        drawCard(); // Redraw to show selection border
    } else {
        // Clicked on empty space - deselect
        selectedText = null;
        drawCard();
    }
});

// Mouse move event - drag text if dragging
canvas.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    if (isDragging && draggedText) {
        // Update text position
        draggedText.x = mouseX - dragOffset.x;
        draggedText.y = mouseY - dragOffset.y;
        
        // Keep text within canvas bounds
        const dimensions = getTextDimensions(draggedText);
        draggedText.x = Math.max(0, Math.min(draggedText.x, canvas.width - dimensions.width));
        draggedText.y = Math.max(dimensions.height, Math.min(draggedText.y, canvas.height));
        
        drawCard();
    } else if (!isPlacingText) {
        // Change cursor when hovering over text
        const hoveredText = getTextAtPosition(mouseX, mouseY);
        canvas.style.cursor = hoveredText ? 'grab' : 'default';
    }
});

// Mouse up event - stop dragging
canvas.addEventListener('mouseup', function() {
    if (isDragging) {
        isDragging = false;
        draggedText = null;
        canvas.style.cursor = 'default';
    }
});

// Mouse leave event - stop dragging if mouse leaves canvas
canvas.addEventListener('mouseleave', function() {
    if (isDragging) {
        isDragging = false;
        draggedText = null;
        canvas.style.cursor = 'default';
    }
});

// Function to change background color
function changeBackground() {
    drawCard();
}

// Function to draw everything on the canvas
function drawCard() {
    const bgColor = document.getElementById('bgColor').value;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all text elements
    textElements.forEach(textObj => {
        ctx.fillStyle = textObj.color;
        ctx.font = `${textObj.size}px Arial`;
        ctx.fillText(textObj.text, textObj.x, textObj.y);
        
        // Draw selection indicator if this text is selected
        if (textObj === selectedText) {
            const dimensions = getTextDimensions(textObj);
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            ctx.strokeRect(textObj.x - 2, textObj.y - dimensions.height - 2, 
                          dimensions.width + 4, dimensions.height + 4);
        }
    });
}

// Color picker event - change selected text color
document.getElementById('textColor').addEventListener('change', function() {
    if (selectedText) {
        selectedText.color = this.value;
        drawCard(); // Redraw immediately with new color
    }
});

// Function to clear the canvas
function clearCanvas() {
    textElements = [];
    isPlacingText = false;
    pendingText = null;
    canvas.style.cursor = 'default';
    drawCard();
}

// Function to download the card as an image
function downloadCard() {
    const link = document.createElement('a');
    link.download = 'my-digital-card.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Initialize with white background
drawCard();