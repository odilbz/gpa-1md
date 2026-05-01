from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


# ─────────────────────────────────────────────────────────
#  Algerian LMD Calculation Engine
# ─────────────────────────────────────────────────────────

<<<<<<< HEAD

=======
>>>>>>> 85b69ca72eec5a31748852517fef285883f031a9
def calc_module_average(exam, td, exam_pct, td_pct):
    """
    Module_Average = (Exam × exam_pct) + (TD × td_pct)
    Weights must sum to 1.0
    """
    return round((exam * exam_pct) + (td * td_pct), 4)


def calc_semester_average(modules):
    """
    Semester_Average = Σ(Module_Average × Coef) / Σ(Coef)
    """
    total_weighted = sum(m["average"] * m["coef"] for m in modules)
<<<<<<< HEAD
    total_coef = sum(m["coef"] for m in modules)
=======
    total_coef     = sum(m["coef"] for m in modules)
>>>>>>> 85b69ca72eec5a31748852517fef285883f031a9
    if total_coef == 0:
        return 0
    return round(total_weighted / total_coef, 4)


def get_mention(avg):
<<<<<<< HEAD
    if avg >= 16:
        return {"label": "Très Bien", "code": "tb"}
    if avg >= 14:
        return {"label": "Bien", "code": "b"}
    if avg >= 12:
        return {"label": "Assez Bien", "code": "ab"}
    if avg >= 10:
        return {"label": "Passable", "code": "p"}
    return {"label": "Ajourné", "code": "f"}
=======
    if avg >= 16:   return {"label": "Très Bien",     "code": "tb"}
    if avg >= 14:   return {"label": "Bien",           "code": "b"}
    if avg >= 12:   return {"label": "Assez Bien",     "code": "ab"}
    if avg >= 10:   return {"label": "Passable",       "code": "p"}
    return              {"label": "Ajourné",           "code": "f"}
>>>>>>> 85b69ca72eec5a31748852517fef285883f031a9


# ─────────────────────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────────────────────

<<<<<<< HEAD

=======
>>>>>>> 85b69ca72eec5a31748852517fef285883f031a9
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/calculate", methods=["POST"])
def calculate():
<<<<<<< HEAD
    data = request.get_json()
    modules = data.get("modules", [])
    errors = []
=======
    data    = request.get_json()
    modules = data.get("modules", [])
    errors  = []
>>>>>>> 85b69ca72eec5a31748852517fef285883f031a9
    results = []

    for i, mod in enumerate(modules):
        label = mod.get("name", "").strip() or f"Module {i + 1}"

        # ── Parse inputs ──────────────────────────────────
        try:
<<<<<<< HEAD
            exam = float(mod.get("exam", 0))
            td = float(mod.get("td", 0))
            exam_pct = float(mod.get("exam_pct", 60)) / 100
            td_pct = float(mod.get("td_pct", 40)) / 100
            coef = float(mod.get("coef", 1))
=======
            exam     = float(mod.get("exam",     0))
            td       = float(mod.get("td",       0))
            exam_pct = float(mod.get("exam_pct", 60)) / 100
            td_pct   = float(mod.get("td_pct",   40)) / 100
            coef     = float(mod.get("coef",      1))
>>>>>>> 85b69ca72eec5a31748852517fef285883f031a9
        except (ValueError, TypeError):
            errors.append(f"Valeurs invalides pour « {label} ».")
            continue

        # ── Validate ──────────────────────────────────────
        if not (0 <= exam <= 20):
            errors.append(f"Note examen invalide pour « {label} » (0–20).")
            continue
        if not (0 <= td <= 20):
            errors.append(f"Note TD/TP invalide pour « {label} » (0–20).")
            continue
        if coef <= 0:
            errors.append(f"Coefficient invalide pour « {label} ».")
            continue
        if abs((exam_pct + td_pct) - 1.0) > 0.01:
            errors.append(f"Les pondérations de « {label} » ne totalisent pas 100 %.")
            continue

<<<<<<< HEAD
        avg = calc_module_average(exam, td, exam_pct, td_pct)
        passed = avg >= 10
        mention = get_mention(avg)

        results.append(
            {
                "name": label,
                "exam": exam,
                "td": td,
                "exam_pct": round(exam_pct * 100),
                "td_pct": round(td_pct * 100),
                "coef": coef,
                "average": avg,
                "weighted": round(avg * coef, 4),
                "passed": passed,
                "mention": mention,
            }
        )
=======
        avg     = calc_module_average(exam, td, exam_pct, td_pct)
        passed  = avg >= 10
        mention = get_mention(avg)

        results.append({
            "name":       label,
            "exam":       exam,
            "td":         td,
            "exam_pct":   round(exam_pct * 100),
            "td_pct":     round(td_pct   * 100),
            "coef":       coef,
            "average":    avg,
            "weighted":   round(avg * coef, 4),
            "passed":     passed,
            "mention":    mention,
        })
>>>>>>> 85b69ca72eec5a31748852517fef285883f031a9

    if errors:
        return jsonify({"error": " | ".join(errors)}), 422

    if not results:
        return jsonify({"error": "Aucun module valide fourni."}), 400

    sem_avg = calc_semester_average(results)
<<<<<<< HEAD
    passed = sem_avg >= 10
    mention = get_mention(sem_avg)

    # Credits (UE validation: module ≥ 10 gets its credits)
    total_coef = sum(m["coef"] for m in results)
    earned_coef = sum(m["coef"] for m in results if m["passed"])
    credit_rate = round((earned_coef / total_coef) * 100, 1) if total_coef else 0

    return jsonify(
        {
            "semester_average": sem_avg,
            "passed": passed,
            "mention": mention,
            "total_coef": round(total_coef, 2),
            "earned_coef": round(earned_coef, 2),
            "credit_rate": credit_rate,
            "module_count": len(results),
            "modules": results,
        }
    )
=======
    passed  = sem_avg >= 10
    mention = get_mention(sem_avg)

    # Credits (UE validation: module ≥ 10 gets its credits)
    total_coef    = sum(m["coef"] for m in results)
    earned_coef   = sum(m["coef"] for m in results if m["passed"])
    credit_rate   = round((earned_coef / total_coef) * 100, 1) if total_coef else 0

    return jsonify({
        "semester_average": sem_avg,
        "passed":           passed,
        "mention":          mention,
        "total_coef":       round(total_coef,  2),
        "earned_coef":      round(earned_coef, 2),
        "credit_rate":      credit_rate,
        "module_count":     len(results),
        "modules":          results,
    })
>>>>>>> 85b69ca72eec5a31748852517fef285883f031a9


if __name__ == "__main__":
    app.run(debug=True)
