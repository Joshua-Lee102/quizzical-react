import React, { useState } from 'react';

export default function App() {
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizStarted, setQuizStarted] = useState(false);
    const [score, setScore] = useState(null);
    const [checked, setChecked] = useState(false);

    function startQuiz() {
        setQuizStarted(true);
        setScore(null);
        setChecked(false);
        fetch('https://opentdb.com/api.php?amount=5&type=multiple')
            .then(response => response.json())
            .then(data => {
                const formattedQuestions = data.results.map(question => {
                    // Combine correct and incorrect answers and shuffle them
                    const allAnswers = [question.correct_answer, ...question.incorrect_answers];
                    const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
    
                    return {
                        ...question,
                        answers: shuffledAnswers
                    };
                });
    
                setQuestions(formattedQuestions);
                const initialAnswers = formattedQuestions.reduce((acc, question, index) => {
                    acc[index] = { selected: null, correct: question.correct_answer };
                    return acc;
                }, {});
                setSelectedAnswers(initialAnswers);
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
                setQuizStarted(false);
            });
    }
    
    function handleAnswerClick(questionIndex, answer) {
        // Allow answer selection only if the answers haven't been checked yet
        if (!checked) {
            setSelectedAnswers(prevAnswers => ({
                ...prevAnswers,
                [questionIndex]: { ...prevAnswers[questionIndex], selected: answer }
            }));
        }
    }

    function checkAnswers() {
        if (!checked) { // Only run if we haven't checked answers yet
            let newScore = 0;
            const answerResults = { ...selectedAnswers };
        
            questions.forEach((question, index) => {
                if (answerResults[index].selected === question.correct_answer) {
                    newScore++;
                }
            });
        
            setSelectedAnswers(answerResults);
            setScore(newScore);
            setChecked(true); // Prevent further answer selections
        }
    }
    
    function getAnswerButtonClass(questionIndex, answer) {
        if (!checked) return '';
        const isCorrect = selectedAnswers[questionIndex]?.correct === answer;
        const isSelected = selectedAnswers[questionIndex]?.selected === answer;

        return isCorrect ? 'correct' : isSelected ? 'incorrect' : '';
    }

    return (
        <div className="start-container">
            <h1 className="title">Quizzical</h1>
            {score === null && <h2 className="title-description">Test Your Knowledge</h2>}
            {!quizStarted && score === null && (
                <button className="start-btn" onClick={startQuiz}>Start Quiz</button>
            )}
            {quizStarted && questions.length > 0 && (
                <div>
                   {questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="quiz-container">
                            <h3 dangerouslySetInnerHTML={{ __html: question.question }} className="question-text" />
                            {question.answers.map((answer, answerIndex) => {
                                let buttonClass = "question-answers";
                                if (selectedAnswers[questionIndex]?.selected === answer) {
                                    buttonClass += " selected";
                                }

                                if (checked) {
                                    if (answer === question.correct_answer) {
                                        buttonClass += " correct";
                                    } else if (selectedAnswers[questionIndex]?.selected === answer) {
                                        buttonClass += " incorrect";
                                    }
                                }

                                return (
                                    <button 
                                        key={answerIndex}
                                        dangerouslySetInnerHTML={{ __html: answer }}
                                        className={buttonClass}
                                        onClick={() => handleAnswerClick(questionIndex, answer)}
                                        disabled={checked && answer !== question.correct_answer}
                                    />
                                );
                            })}
                        </div>
                    ))}
                    {score === null ? (
                        <button className="check-btn" onClick={checkAnswers}>Check Answers</button>
                    ) : (
                        <div className="end-container">
                            <div className="answers">You scored {score}/{questions.length} correct answers</div>
                            <button className="play-again-btn" onClick={startQuiz}>Play again</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
