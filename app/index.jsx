{/*

Project phases:

1 - Data collection/logical view
- Find a recipe dataset
    - https://www.kaggle.com/datasets/shuyangli94/food-com-recipes-and-user-interactions
    - I found this we can reference it https://www.kaggle.com/code/ngohoantamhuy/food-recommendation-systems 
    - https://archive.ics.uci.edu/dataset/911/recipe+reviews+and+user+feedback+dataset

- Design internal storage system
- Build a logical view with fields to search/rank on
    - Fields: number of ingredients, recipeId, title, ingredients, totalTime, cuisine, difficulty
    - ranking relevant: ingredient match count, user rating, nutrition tags(?)



2 - Build UI
- Allow users to input their ingredients, preferences, etc.
    - Builds user logical view: preferred cuisines, maximum total cook time, liked recipes, disliked recipes, ingredients
- Enable basic filters/sorting


3 - Personal model/refinement
- Develop personalized model and context, improve search/recommendation logic
    - Real time weather API: consider https://openweathermap.org/price (1000 calls per day for free)


*/}

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const index = () => {
  return (
    <View>
      <Text>Hello World</Text>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})