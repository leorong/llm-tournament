from flask import request, jsonify
from models import db, Question, Prompt, Matchup, Vote
from utils import generate_llm_output
import random

def register_routes(app):

    @app.route('/api/questions', methods=['POST'])
    def create_question():
        data = request.json
        text = data.get('text')
        prompts = data.get('prompts', [])  # Optional list of prompts

        if not text:
            return jsonify({"error": "Question text is required"}), 400

        # Create the question
        question = Question(text=text)
        db.session.add(question)
        db.session.commit()

        # Add prompts if provided
        added_prompts = []
        for prompt_text in prompts:
            if not prompt_text.strip():
                continue
            prompt = Prompt(question_id=question.id, text=prompt_text.strip())
            db.session.add(prompt)
            added_prompts.append({"id": prompt.id, "text": prompt.text})

        db.session.commit()

        response = {
            "message": "Question created",
            "question": {
                "id": question.id,
                "text": question.text,
                "prompts": added_prompts
            }
        }

        return jsonify(response), 201
    
    @app.route('/api/questions/list', methods=['GET'])
    def get_questions():
        questions = Question.query.all()
        result = []
        
        for question in questions:
            result.append({
                "id": question.id,
                "text": question.text,
                "created_at": question.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "num_prompts": len(question.prompts)
            })

        return jsonify(result), 200

    @app.route('/api/questions/<question_id>/prompts', methods=['POST'])
    def add_prompts(question_id):
        data = request.json
        prompts = data.get('prompts')

        if not prompts or not isinstance(prompts, list):
            return jsonify({"error": "A list of prompts is required"}), 400

        if not prompts:
            return jsonify({"error": "The prompt list is empty"}), 400

        question = Question.query.get(question_id)
        if not question:
            return jsonify({"error": "Question not found"}), 404

        added_prompts = []
        for prompt_text in prompts:
            if not prompt_text.strip():
                continue
            prompt = Prompt(question_id=question_id, text=prompt_text.strip())
            db.session.add(prompt)
            added_prompts.append(prompt)

        db.session.commit()

        return jsonify({
            "message": "Prompts added successfully",
            "prompts": [{"id": p.id, "text": p.text} for p in added_prompts]
        }), 201
    
    @app.route('/api/questions/<question_id>/prompts', methods=['GET'])
    def get_prompts_for_question(question_id):
        question = Question.query.get(question_id)

        if not question:
            return jsonify({"error": "Question not found"}), 404

        prompts = question.prompts

        result = []
        for prompt in prompts:
            result.append({
                "id": prompt.id,
                "text": prompt.text,
                "created_at": prompt.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "score": prompt.score
            })

        return jsonify({
            "id": question.id,
            "text": question.text,
            "created_at": question.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "prompts": result
        }), 200

    @app.route('/api/questions/<question_id>/generate-matchup', methods=['POST'])
    def generate_matchup(question_id):
        question = Question.query.get(question_id)
        if not question:
            return jsonify({"error": "Question not found"}), 404

        prompts = question.prompts
        if len(prompts) < 2:
            return jsonify({"error": "At least two prompts are required to generate a matchup"}), 400

        # Randomly select two distinct prompts
        prompt1, prompt2 = random.sample(prompts, 2)

        # Generate outputs for the selected prompts
        output1 = generate_llm_output(prompt1.text, question.text)
        output2 = generate_llm_output(prompt2.text, question.text)

        # Create a new matchup
        matchup = Matchup(
            question_id=question.id,
            prompt1_id=prompt1.id,
            output1=output1,
            prompt2_id=prompt2.id,
            output2=output2
        )

        db.session.add(matchup)
        db.session.commit()

        return jsonify({
            "message": "Matchup generated",
            "matchup": {
                "id": matchup.id,
                "prompt1": {
                    "id": prompt1.id,
                    "text": prompt1.text,
                },
                "output1": output1,
                "prompt2": {
                    "id": prompt2.id,
                    "text": prompt2.text,
                },
                "output2": output2
            }
        }), 201

    @app.route('/api/matchups/<matchup_id>/vote', methods=['POST'])
    def vote(matchup_id):
        data = request.json
        winner_prompt_id = data.get('winner_prompt_id')

        matchup = Matchup.query.get(matchup_id)
        if not matchup:
            return jsonify({"error": "Matchup not found"}), 404

        if winner_prompt_id not in [matchup.prompt1_id, matchup.prompt2_id]:
            return jsonify({"error": "Invalid winner prompt ID for this matchup"}), 400

        vote = Vote(matchup_id=matchup_id, winner_prompt_id=winner_prompt_id)
        db.session.add(vote)

        # Update the score for the winning prompt
        winning_prompt = Prompt.query.get(winner_prompt_id)
        winning_prompt.score += 1

        db.session.commit()

        return jsonify({"message": "Vote recorded", "new_score": winning_prompt.score}), 200
