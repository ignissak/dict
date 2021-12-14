window.onload = () => {

    const input = document.getElementById('search')
    const redColor = getComputedStyle(document.documentElement).getPropertyValue('--red-color');
    const darkStrokeColor = getComputedStyle(document.documentElement).getPropertyValue('--dark-stroke-color');
    const loader = document.getElementById('loader');

    let typingTimer;
    let doneTypingInterval = 300;

    //on keyup, start the countdown
    input.addEventListener('keyup', () => {
        clearTimeout(typingTimer);
        if (input.value) {
            typingTimer = setTimeout(doneTyping, doneTypingInterval);
        }
    });

    //user is "finished typing," do something
    async function doneTyping() {
        defaultInput();

        await update(input.value.trim());
    }

    input.addEventListener('input', async (event) => {
        defaultInput(); // In case of CTRL + A + DELETE
    })

    async function update(value) {
        if (isEmpty(value)) {
            document.querySelectorAll('.card').forEach(el => el.remove());

            console.log("Deleting cards...");
            return;
        }

        showLoader();

        const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + value);

        if (response.status == 404) {
            redInput();
            hideLoader();
            return;
        }

        defaultInput();

        const json = await response.json();

        printResult(json);
    }

    function showLoader() {
        loader.style.display = "inline-block";
    }

    function hideLoader() {
        loader.style.display = "none";
    }

    function printResult(json) {
        const outputDiv = document.getElementById('output');

        outputDiv.innerHTML = "";
        for (obj of json) {
            const word = obj['word']
            const phonetic = obj['phonetic']
            const categories = obj['meanings'] // category

            const cardDiv = createElement("div", { class: "card" });
            const cardContentDiv = createElement("div", { class: "card-content" });

            const cardTitleDiv = createElement("div", {class: "card-title"});

            const button = createElement("button", {onclick: "responsiveVoice.speak('" + word + "')", type: "button", class: "tts"});
            button.appendChild(createElement("i", {class: "far fa-volume"}));

            let _div = createElement("div");

            _div.appendChild(createElement("h2", { value: word }))
            if (phonetic) {
                _div.appendChild(createElement("p", { class: "phonetics", value: phonetic }));
            }

            cardTitleDiv.appendChild(button);
            cardTitleDiv.appendChild(_div);

            cardContentDiv.appendChild(cardTitleDiv);

            // <i class="fas fa-volume-up"></i>
            const categoryDivs = [];
            for (category of categories) {
                const type = category['partOfSpeech']

                let categoryDiv = createElement('div', { class: "category" });
                categoryDiv.appendChild(createElement("hr"));
                categoryDiv.appendChild(createElement("p", { class: "category", value: type }));

                let num = 1;
                for (definitionObj of category['definitions']) {
                    let entryDiv = createElement("div", { class: "entry" });
                    entryDiv.appendChild(createElement("p", { class: "num", value: `${num}.` }));

                    // 
                    let container = createElement("div");

                    const definition = definitionObj['definition'];
                    const example = definitionObj['example'];
                    const synonyms = definitionObj['synonyms'];
                    const antonyms = definitionObj['antonyms'];

                    let definitionP = createElement("p", { class: "m-bot-4", value: definition });
                    container.appendChild(definitionP);

                    if (example) {
                        let exampleP = createElement("p", { class: "m-bot-4 example", value: example });
                        container.appendChild(exampleP);
                    }

                    if (typeof (synonyms) !== "undefined") {
                        if (synonyms.length > 0) {
                            let synonymContainer = createElement("div", { class: "synonym-container" });

                            synonymContainer.appendChild(createElement("p", { class: "synonyms", value: "Synonyms:" }))

                            for (synonym of synonyms) {
                                let el = createElement("p", { class: "synonym", value: synonym });
                                synonymContainer.appendChild(el);
                            }

                            container.appendChild(synonymContainer);
                        }
                    }

                    if (typeof (antonyms) !== "undefined") {
                        if (antonyms.length > 0) {
                            let antonymContainer = createElement("div", { class: "antonym-container" });

                            antonymContainer.appendChild(createElement("p", { class: "antonyms", value: "Antonyms:" }))

                            for (antonym of antonyms) {
                                antonymContainer.appendChild(createElement("p", { class: "antonym", value: antonym }))
                            }

                            container.appendChild(antonymContainer);
                        }
                    }

                    entryDiv.appendChild(container);

                    categoryDiv.appendChild(entryDiv);

                    num++;
                }

                categoryDivs.push(categoryDiv);
            }

            for (categoryDiv of categoryDivs) {
                cardContentDiv.appendChild(categoryDiv);
            }

            cardDiv.appendChild(cardContentDiv);
            outputDiv.appendChild(cardDiv);
        }

        // const synonymsContainers = document.querySelectorAll(".synonym-container");

        // for (synonymContainer of synonymsContainers) {
        //     console.log(synonymsContainer);
        // }
        hideLoader();
    }

    function redInput() {
        input.style.border = `1px solid ${redColor}`
    }

    function defaultInput() {
        input.style.border = `1px solid ${darkStrokeColor}`
    }
}

function isEmpty(str) {
    return (!str || str.length === 0 || str === "");
}

function createElement(type, options) {
    const element = document.createElement(type);

    if (typeof (options) === "undefined" || typeof (options) === "null") {
        return element;
    }

    if (options['value']) {
        element.appendChild(document.createTextNode(options['value']));
    }

    for (const [key, value] of Object.entries(options)) {
        if (key === "value") continue;
        element.setAttribute(key, value);
    }

    return element;
}