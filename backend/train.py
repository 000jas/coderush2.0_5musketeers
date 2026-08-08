import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier

def train_model():
    print("Loading dataset...")
    df = pd.read_csv("satellite_dataset.csv")

    # Drop Scenario ID column as it's not a predictive feature
    if "Scenario ID" in df.columns:
        df = df.drop(columns=["Scenario ID"])

    # Standardize string missing values
    df = df.fillna("nan")

    # Define categorical columns
    categorical_columns = [
        "Health Signal", "Subsystem", "Current Task", "Condition",
        "Anomaly", "Recommended Procedure", "Expected Outcome",
        "Operator Approval Required", "Priority"
    ]

    print("Encoding features and labels...")
    encoders = {}
    for col in categorical_columns:
        le = LabelEncoder()
        # Force string type to prevent any numeric/NaN mixed type issues
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    # Define inputs (X) and targets (y)
    X_cols = ["Health Signal", "Subsystem", "Current Task", "Condition"]
    y_cols = ["Anomaly", "Recommended Procedure", "Expected Outcome", "Operator Approval Required", "Priority"]

    X = df[X_cols]
    y = df[y_cols]

    print(f"Training MultiOutput RandomForestClassifier on {len(df)} samples...")
    # Use a high-quality RandomForestClassifier as the base estimator
    base_clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    model = MultiOutputClassifier(base_clf)
    model.fit(X, y)

    # Validate training accuracy
    score = model.score(X, y)
    print(f"Model training complete. Training accuracy score: {score:.4f}")

    print("Saving model and encoders...")
    joblib.dump(model, "satellite_model.joblib")
    joblib.dump(encoders, "telemetry_encoders.joblib")
    print("Files 'satellite_model.joblib' and 'telemetry_encoders.joblib' successfully generated!")

if __name__ == "__main__":
    train_model()
