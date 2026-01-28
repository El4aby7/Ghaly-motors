import json
import sys
import os

def validate_vehicle_data(filepath):
    if not os.path.exists(filepath):
        print(f"Error: File not found at {filepath}")
        sys.exit(1)

    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format. {e}")
        sys.exit(1)

    if not isinstance(data, list):
        print("Error: Root element must be a list")
        sys.exit(1)

    required_keys = ['id', 'make', 'model', 'price', 'year', 'mileage', 'image', 'tags', 'type', 'specs']

    for index, vehicle in enumerate(data):
        missing_keys = [key for key in required_keys if key not in vehicle]
        if missing_keys:
            print(f"Error: Vehicle at index {index} missing keys: {missing_keys}")
            sys.exit(1)

        if not isinstance(vehicle['specs'], list):
            print(f"Error: 'specs' must be a list for vehicle ID {vehicle.get('id')}")
            sys.exit(1)

        for spec in vehicle['specs']:
            if 'label' not in spec or 'value' not in spec:
                print(f"Error: Invalid spec format in vehicle ID {vehicle.get('id')}")
                sys.exit(1)

    print("Success: vehicles.json is valid.")

if __name__ == "__main__":
    validate_vehicle_data('assets/data/vehicles.json')
