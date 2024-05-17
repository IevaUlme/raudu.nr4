import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { firebase, db, auth} from './config';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; 

const QuestionItem = ({ question, index, selectedOption, onSelectOption, showResults }) => {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.question}>{`${index + 1}. ${question.question}`}</Text>
      {[1, 2, 3, 4].map(optionIndex => {
        const isSelected = selectedOption === optionIndex;
        const isCorrectOption = selectedOption === question.correctOption && showResults;
        const isWrong = showResults && isSelected && !isCorrectOption;
        const isCorrect = showResults && isSelected && isCorrectOption;
        
        return (
          <TouchableOpacity
            key={optionIndex}
            style={[
              styles.option,
              isSelected && !showResults && styles.selectedOptions, 
              isCorrect && isSelected && styles.correctOption,
              isWrong && styles.wrongOption,
            ]}
            onPress={() => onSelectOption(optionIndex)}
            disabled={showResults}
          >
            <Text>{question['option' + optionIndex]}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const Quizz = ({ route }) => {
  const navigation = useNavigation();

  const [questions, setQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(Array(10).fill({}));
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [optionChosen, setOptionChosen] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [incorrectlyAnsweredQuestions, setIncorrectlyAnsweredQuestions] = useState([]);
  const [uniqueQuestionCount, setUniqueQuestionCount] = useState(0); 
  const [learnedWordsCount, setLearnedWordsCount] = useState(0); 
  const [userId, setUserId] = useState('');
  const [progress, setProgress] = useState(0); 

  const { category } = route.params || {};

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(''); 
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userId && uniqueQuestionCount === 0) {
      updateUserUniqueQuestionCount(uniqueQuestionCount + 1);
    }
  }, [userId, uniqueQuestionCount]);

  useEffect(() => {
    if (userId && showResults) {
      updateUserUniqueQuestionCount(uniqueQuestionCount);
    }
  }, [userId, showResults, uniqueQuestionCount]);

  useEffect(() => {
    if (category) {
      getQuestions();
    }
    getQuestions();
  }, [category]);

  useEffect(() => {
    const newLearnedWordsCount = uniqueQuestionCount - incorrectlyAnsweredQuestions.length;
    setLearnedWordsCount(newLearnedWordsCount);
    if (userId) {
      updateUserLearnedWordsCount(newLearnedWordsCount); 
    }
  }, [questions]);
  
  const getQuestions = async () => {
    setSelectedOptions(Array(10).fill({}));
    setShowResults(false);
    setAnswerSubmitted(false);
    setProgress(0); 
    const db = firebase.firestore();
    const questionsRef = db.collection('questions');
    const snapshot = await questionsRef.where('category', '==', category).get();
    if (snapshot.empty) {
      console.log('No such documents');
      return;
    }
    const allQuestions = snapshot.docs.map(doc => doc.data());
    const shuffleQuestions = allQuestions.sort(() => 0.5 - Math.random());
    setQuestions(shuffleQuestions.slice(0, 10));
    setCurrentQuestionIndex(0);
    setOptionChosen(false);
    setIncorrectlyAnsweredQuestions([]);
    if (uniqueQuestionCount === 0) {
      setUniqueQuestionCount(new Set(allQuestions.map(question => question.question)).size);
    }
  };

  const handleOptionSelect = option => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[currentQuestionIndex] = option;
    setSelectedOptions(updatedOptions);
    setOptionChosen(true);
  };
  
  const handleNextQuestion = async () => {
    if (!answerSubmitted && !showResults) {
      Alert.alert('Lūdzu ievadiet atbildi pirms došanās uz nākamo jautājumu!');
      return;
    }
  
    const currentQuestion = questions[currentQuestionIndex];
  
    if (!currentQuestion) {
      return;
    }
  
    const isCorrect = selectedOptions[currentQuestionIndex] === currentQuestion.correctOption;
  
    if (!isCorrect) {
      setIncorrectlyAnsweredQuestions(prev => {
        const updatedQuestions = [...prev, currentQuestionIndex];
        console.log("updatedQuestions:", updatedQuestions);
        return updatedQuestions;
      });
    } else {
      setProgress(prevProgress => prevProgress + (1 / questions.length) * 100);
    if (userId && uniqueQuestionCount === 0) {
      const newCount = uniqueQuestionCount + 1;
      setUniqueQuestionCount(newCount);
      updateUserUniqueQuestionCount(userId, newCount);
    }
    }
  
    const nextQuestionIndex = currentQuestionIndex + 1;
  
    if (nextQuestionIndex >= questions.length) {
      if (!isCorrect || incorrectlyAnsweredQuestions.length > 0) {
        const repeatedQuestions = incorrectlyAnsweredQuestions.map(index => questions[index]);
        if (!isCorrect) {
          repeatedQuestions.push(currentQuestion);
        }
        setQuestions(repeatedQuestions);
        setCurrentQuestionIndex(0);
        setOptionChosen(false);
        setAnswerSubmitted(false);
        setShowResults(false);
        setIncorrectlyAnsweredQuestions([]);
        return;
      } else {
        setShowResults(true);
        return;
      }
    }
  
    setCurrentQuestionIndex(nextQuestionIndex);
    setOptionChosen(false);
    setAnswerSubmitted(false);

if (userId && uniqueQuestionCount === 0) {
  const categoryQuestions = questions.filter(question => question.category === currentQuestion.category);
  const categoryLearnedWordsCount = categoryQuestions.length;

  const newLearnedWordsCount = learnedWordsCount + categoryLearnedWordsCount;
  setLearnedWordsCount(newLearnedWordsCount);

  updateUserLearnedWordsCount(newLearnedWordsCount);
}
  };

  const handleSubmitAnswer = () => {
    if (optionChosen && currentQuestionIndex === questions.length - 1) {
      setAnswerSubmitted(true);
    } else if (optionChosen) {
      setAnswerSubmitted(true);
    } else {
      Alert.alert('Lūdzu izvēlieties atbildi pirms tās iesniegšanas!');
    }
  };

  const updateUserUniqueQuestionCount = async (count) => {
    try {
      await db.collection('users').doc(userId).update({
        uniqueQuestionCount: count
      });
      console.log('User unique question count updated:', count);
    } catch (error) {
      console.error('Error updating user unique question count:', error);
    }
  };

  const updateUserLearnedWordsCount = async (count) => {
    try {
      await db.collection('users').doc(userId).update({
        learnedWordsCount: count
      });
      console.log('User learned words count updated:', count);
    } catch (error) {
      console.error('Error updating user learned words count:', error);
    }
  };
  

  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <AntDesign name="close" size={40} color="black" fontWeight='bold'/>
      </TouchableOpacity>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      {questions.length > 0 && (
        <QuestionItem
          question={questions[currentQuestionIndex]}
          index={currentQuestionIndex}
          selectedOption={selectedOptions[currentQuestionIndex]}
          onSelectOption={handleOptionSelect}
          showResults={showResults}
        />
      )}
      <View>
        <TouchableOpacity
          style={[styles.submitButton, showResults && { display: 'none' }]}
          onPress={handleSubmitAnswer}
          disabled={showResults}
        >
          <Text style={styles.submitButtonText}>Iesniegt atbilidi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, showResults && { display: 'none' }]}
          onPress={handleNextQuestion}
          disabled={showResults}
        >
          <Text style={styles.submitButtonText}>Nākamais jautājums</Text>
        </TouchableOpacity>
      </View>
      {showResults && (
        <View>
          <Text style={styles.resultText}>
            Tu iemācījies {uniqueQuestionCount} jaunus vārdus.
          </Text>
          <TouchableOpacity style={styles.tryAgainButton} onPress={getQuestions}>
            <Text style={styles.tryAgainButtonText}>Mēģināt vēlreiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Quizz;


const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#FDB913',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 1,
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBar: {
    backgroundColor: '#006A44',
    height: 10,
    borderRadius: 5,
  },
  questionContainer:{
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset:{
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 350,
  },
  question:{
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  option:{
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 20, 
    marginVertical: 5,
    borderRadius: 5,
    minWidth: '100%', 
  },
  selectedOptions:{
    backgroundColor: '#949494',
  },
  correctOption:{
    backgroundColor: '#006A44',
  },
  wrongOption:{
    backgroundColor: 'red',
  },
  submitButton:{
    backgroundColor: '#006A44',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    justifyContent: 'center',
    width: 350,
    alignItems: 'center',
    alignSelf: 'center',
  },
  submitButtonText:{
    color: '#fff',
    fontSize: 20,
  },
  result:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText:{
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    alignItems: 'center',
     alignSelf: 'center',
  },
  tryAgainButton:{
    backgroundColor: '#006A44',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: 350,
    alignItems: 'center',
    alignSelf: 'center',
  },
  tryAgainButtonText:{
    color: '#fff',
    fontSize: 20,
  }
});
