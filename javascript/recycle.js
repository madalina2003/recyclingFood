let score = 0;

document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('dragstart', dragStart);
});

document.querySelectorAll('.bin').forEach(bin => {
    bin.addEventListener('dragover', dragOver);
    bin.addEventListener('drop', drop);
});

function dragStart(event) {
    event.dataTransfer.setData('text', event.target.dataset.bin);
    event.target.style.opacity = '0.5';
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const correctBin = event.dataTransfer.getData('text');
    const targetBin = event.target.id;

    if (targetBin.includes(correctBin)) {
        score += 10;
        document.getElementById('score').innerText = `Score: ${score}`;
        event.target.style.backgroundColor = '#a0ff8f';
    } else {
        alert('Incorrect! Try again.');
    }
}
