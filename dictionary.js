import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, Keyboard } from 'react-native';
import { firebase } from './config';

const DictionaryPage = ({ navigation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [questions, setQuestions] = useState([]);
    const [correctOptionText, setCorrectOptionText] = useState('');
    const [infoText, setInfoText] = useState('');

    useEffect(() => {
        fetchQuestions();
        return () => {
            clearSearchTerm();
            setCorrectOptionText('');
            setInfoText('');
        };
    }, []);

    //Lietotne piekļūst jautājumiem
    const fetchQuestions = async () => {
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('questions').get();
            const data = snapshot.docs.map(doc => doc.data());
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    //Vārdu meklēšana
    const handleSearch = () => {
        const sanitizedSearchTerm = removeSymbols(searchTerm.toLowerCase());
        const foundQuestion = questions.find(question => removeSymbols(question.question.toLowerCase()) === sanitizedSearchTerm);
        
        if (foundQuestion) {
            const correctOption = 'option' + foundQuestion.correctOption;
            const optionText = foundQuestion[correctOption];
            setCorrectOptionText(optionText);
            setInfoText('Pareizi lietuviski teikt:');
        } else {
            setCorrectOptionText('');
            setInfoText('');
            Alert.alert(
                "Vārds vai frāze nav atrasts",
                "Teksts, ko mēģinājāt atrast, neatrodas mūsu datubāzē",
                [{ text: "Labi" }]
            );
        }
        
        Keyboard.dismiss();
    };

    const clearSearchTerm = () => {
        setSearchTerm('');
    };

    //Liekas atstarpes un simboli netraucē meklēšanā
    const removeSymbols = (text) => {
        return text.replace(/[^\w]/g, '');
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Ievadiet vārdu"
                placeholderTextColor="#999"
                autoFocus={true}
                onChangeText={text => setSearchTerm(text)}
                onBlur={clearSearchTerm} 
                value={searchTerm} 
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.buttonText}>Meklēt</Text>
            </TouchableOpacity>
            {correctOptionText ? (
                <View style={styles.correctOptionContainer}>
                    <Text style={styles.infoText}>{infoText}</Text>
                    <Text style={styles.correctOptionText}>{correctOptionText}</Text>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDB913',
        alignItems: 'center',
        justifyContent: 'center',
    },

    searchBar: {
        width: '80%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 18,
        textAlign: 'center',
        borderWidth: 3,
        borderColor: 'black',
        marginBottom: 20,
    },
    searchButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#006A44',
        borderRadius: 5,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    correctOptionContainer: {
        alignItems: 'center',
    },
    infoText: {
        fontSize: 20,
        marginBottom: 5,
    },
    correctOptionText: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 5,
    },

});

export default DictionaryPage;
