const fs = require('fs');
const path = require('path');

const list = fs.readFileSync(path.resolve(".","words.txt"),'utf8');
const words = list.split("\n").filter((word) => word.length == 5);

const alpha = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

function find_best_word(matched_letters, remaining_letters, words){
    let alpha = [...matched_letters, ...remaining_letters];
    const alpha_count = {};
    for(const word of words){
        let w = {};
        for(const letter of word.split('')){
            if(!alpha_count[letter]) alpha_count[letter] = 1;
            else alpha_count[letter]++;
        }
    }
    const word_score = {};
    for(let i = words.length -1; i >= 0; i--){
        let word = words[i]
        word_score[word] = 0;
        const simple_word = word.split('').filter((letter, pos) => word.indexOf(letter) == pos);
        for(const letter of simple_word){
            // if(!(words.length >= 20 && matched_letters.includes(letter))){
            if(!matched_letters.includes(letter)){
                word_score[word]+=alpha_count[letter];
            }
        }
    }
    let best_word = words[0];
    let best_score = word_score[best_word];
    for(const word of words){
        if(best_score < word_score[word]){
            best_word = word;
            best_score = word_score[best_word];
        }
    }
    return best_word;
}

async function getGuess(){
    return new Promise(resolve => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        })
        readline.question("Enter Your Guess: ", (guess) => {
            resolve(guess);
            readline.close();
        })
    })
}

async function solver(words, match_index, matched_letters, remaining_letters, non_matches){
    const guessAns = await getGuess();
    const guess = guessAns.split(",")
    //guess[0] is word guessed
    //guess[1] is _(no match), a(letter match), A(index match)

    const guessed_letters = guess[0].split('').filter((letter, pos) => guess[0].indexOf(letter) == pos);
    for(const letter of guessed_letters){
        if(remaining_letters.includes(letter)) remaining_letters.splice(remaining_letters.indexOf(letter),1);
    }
    let solved = true;
    const match_arr = guess[1].split('');
    for(let i = 0; i < 5; i++){
        if(match_arr[i] !== '_'){
            if(match_arr[i] === match_arr[i].toUpperCase()){
                match_index[i] = match_arr[i].toLowerCase();
            } else {
                non_matches[i].push(match_arr[i]);
                solved = false;
            }
            if(!matched_letters.includes(match_arr[i])){
                matched_letters.push(match_arr[i].toLowerCase());
            }
        }
        else{
            solved = false;
        }
    }
    if(solved){
        console.log("CONGRATS!")
        return;
    }
    const new_words = words.filter((word) => {
        if(word == guess[0]) return false;

        let word_arr = word.split('');
        for(let i = 0; i < 5; i++){
            if(match_index[i] !== '_' && match_index[i] !== word_arr[i]) return false;
            if(non_matches[i].includes(word_arr[i])) return false;
        }
        for(const letter of matched_letters){
            if(!word_arr.includes(letter)) return false;
        }
        for(const letter of word.split('')){
            if(![...matched_letters, ...remaining_letters].includes(letter)) return false;
        }
        return true;
    });
    console.log(`Index Matches: ${match_index.join('')}`);
    console.log(`Matched Letters: ${matched_letters}`)
    console.log(`Unguessed Letters: ${remaining_letters}`);
    console.log(`Best Guess: ${find_best_word(matched_letters, remaining_letters, new_words)}`)
    // console.log(``)
    if(new_words.length < 10){
        console.log(`Remaining Words: ${new_words}`);
    }
    console.log("+++++++++++++++++++++++++++++\n\n");

    solver(new_words, match_index, matched_letters, remaining_letters, non_matches);  
}
console.log(`Best First Guess: ${find_best_word('',alpha, words)}`);
solver(words, ['_','_','_','_','_'], [], alpha,{0:[],1:[],2:[],3:[],4:[]});