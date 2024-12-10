from flask import Flask, render_template, request
import tensorflow as tf
import numpy as np
import pandas as pd
from model import CustomAutoencoder  # Import your custom model class
from sklearn.metrics.pairwise import cosine_similarity

# Initialize the Flask application
app = Flask(__name__)

# Load the saved model with custom layers
try:
    loaded_model = tf.keras.models.load_model('custom_autoencoder_model.keras', custom_objects={'CustomAutoencoder': CustomAutoencoder})
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    loaded_model = None  # Fallback if model loading fails

# Load latent embeddings
try:
    latent_embeddings = np.load("latent_embeddings.npy")
except FileNotFoundError:
    print("Latent embeddings file not found!")
    latent_embeddings = np.array([])  # Fallback to an empty array

# Load the dataset
try:
    recipes_df = pd.read_csv("full_format_recipes.csv")
except FileNotFoundError:
    print("Dataset file not found!")
    recipes_df = pd.DataFrame()

recipe_titles = recipes_df['title'].tolist() if not recipes_df.empty else []

# Utility function to recommend recipes based on latent similarity
def recommend_similar(liked_recipe_indices, filtered_latent_embeddings, top_n=10):
    if not isinstance(filtered_latent_embeddings, np.ndarray):
        filtered_latent_embeddings = filtered_latent_embeddings.numpy()

    # Ensure indices are within bounds
    liked_recipe_indices = [idx for idx in liked_recipe_indices if 0 <= idx < len(filtered_latent_embeddings)]
    if not liked_recipe_indices:
        raise ValueError("All indices in liked_recipe_indices are out of bounds.")

    liked_embeddings = filtered_latent_embeddings[liked_recipe_indices]

    # Calculate cosine similarity
    similarity_scores = cosine_similarity(liked_embeddings, filtered_latent_embeddings)

    # Aggregate the scores for the liked recipes
    aggregated_scores = np.mean(similarity_scores, axis=0)

    # Get top_n recommended indices
    recommended_indices = np.argsort(-aggregated_scores)
    recommended_indices = [idx for idx in recommended_indices if idx not in liked_recipe_indices][:top_n]

    return recommended_indices

# Helper function to filter the dataset based on calorie constraints
def filter_dataset(target_calories, tolerance=200):
    min_calories = target_calories - tolerance
    max_calories = target_calories + tolerance
    return recipes_df[
        (recipes_df['calories'] >= min_calories) & 
        (recipes_df['calories'] <= max_calories)
    ]

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        try:
            # Get user inputs
            weight = float(request.form['weight'])
            height = float(request.form['height'])
            age = int(request.form['age'])
            gender = int(request.form['gender'])
            activity_level = int(request.form['activity_level'])

            # Calculate BMI
            bmi = weight / (height / 100) ** 2
            if bmi < 18.5:
                bmi_status = "Underweight"
                calorie_target = maintain(weight, height, age, gender, activity_level) * 1.15
            elif 18.5 <= bmi < 24.9:
                bmi_status = "Ideal Weight"
                calorie_target = maintain(weight, height, age, gender, activity_level)
            else:
                bmi_status = "Overweight"
                calorie_target = maintain(weight, height, age, gender, activity_level) * 0.8

            # Target calories per meal
            target_calories_per_meal = calorie_target / 3

            # Filter dataset and recommend recipes
            filtered_df = filter_dataset(target_calories_per_meal)
            filtered_indices = filtered_df.index.tolist()
            filtered_latent_embeddings = latent_embeddings[filtered_indices]

            # Placeholder liked recipes (to be dynamic later)
            liked_recipe_indices = [0, 1, 2]
            recommended_indices = recommend_similar(liked_recipe_indices, filtered_latent_embeddings)
            final_recommendations = filtered_df.iloc[recommended_indices].to_dict(orient='records')

            return render_template('recommendation_page.html', recommended_recipes=final_recommendations,
                                   target_calories_per_meal=round(target_calories_per_meal, 2),
                                   bmi_status=bmi_status)
        except Exception as e:
            return f"An error occurred: {e}"

    return render_template('home.html')

def maintain(weight, height, age, gender, activity_level):
    if gender == 1:
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    elif gender == 2:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    else:
        return "Invalid data"

    activity_multipliers = {1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9}
    return round(bmr * activity_multipliers[activity_level], 2)

if __name__ == '__main__':
    app.run(debug=True)
