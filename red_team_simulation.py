import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


SIZE = 50
CYCLES = 1000
SEED = 42
INJECTION_INTERVAL = 50
INJECTION_COUNT = 3
INJECTION_RADIUS = 5
INJECTION_STRENGTH = 0.3
OUTPUT_DIR = "outputs"


def inject_exploit(grid: np.ndarray, size: int) -> np.ndarray:
    """Inject clustered high-value signals to emulate red-team activity."""
    for _ in range(INJECTION_COUNT):
        cx, cy = np.random.randint(0, size, 2)
        for i in range(max(0, cx - INJECTION_RADIUS), min(size, cx + INJECTION_RADIUS + 1)):
            for j in range(max(0, cy - INJECTION_RADIUS), min(size, cy + INJECTION_RADIUS + 1)):
                dist = ((i - cx) ** 2 + (j - cy) ** 2) ** 0.5
                if dist <= INJECTION_RADIUS:
                    boost = INJECTION_STRENGTH * (1 - dist / INJECTION_RADIUS)
                    grid[i, j] = min(1.0, grid[i, j] + boost)
    return grid


def run_red_team_simulation(size: int = SIZE, cycles: int = CYCLES, seed: int = SEED) -> pd.DataFrame:
    """Run a baseline-vs-exploit simulation and return cycle-level metrics."""
    np.random.seed(seed)
    results = []

    for cycle in range(cycles):
        grid = np.random.rand(size, size)
        exploit_phase = cycle % INJECTION_INTERVAL == 0

        if exploit_phase:
            grid = inject_exploit(grid, size)

        avg = float(np.mean(grid))
        std = float(np.std(grid))
        threshold = avg + (2 * std)
        anomaly_count = int(np.sum(grid > threshold))

        results.append(
            {
                "cycle": cycle + 1,
                "average_value": avg,
                "std_value": std,
                "min_value": float(np.min(grid)),
                "max_value": float(np.max(grid)),
                "anomaly_count": anomaly_count,
                "exploit_phase": exploit_phase,
            }
        )

    return pd.DataFrame(results)


def save_outputs(df: pd.DataFrame, output_dir: str = OUTPUT_DIR) -> None:
    os.makedirs(output_dir, exist_ok=True)

    csv_path = os.path.join(output_dir, "red_team_simulation_metrics.csv")
    df.to_csv(csv_path, index=False)

    plt.figure(figsize=(12, 7))
    plt.plot(df["cycle"], df["average_value"], label="Average Value", linewidth=1.2)
    plt.plot(df["cycle"], df["std_value"], label="Std Dev", linewidth=1.2, alpha=0.8)

    exploit_cycles = df[df["exploit_phase"]]["cycle"]
    for i, cycle in enumerate(exploit_cycles):
        plt.axvline(cycle, color="red", linestyle="--", alpha=0.15, label="Exploit Cycle" if i == 0 else None)

    plt.title("Red-Team Stimulation: Grid Dynamics Over Cycles")
    plt.xlabel("Cycle")
    plt.ylabel("Value")
    plt.legend()
    plt.tight_layout()

    plot_path = os.path.join(output_dir, "red_team_simulation_plot.png")
    plt.savefig(plot_path, dpi=180)
    plt.close()

    summary = {
        "total_cycles": int(df.shape[0]),
        "exploit_cycles": int(df["exploit_phase"].sum()),
        "avg_of_avg_values": float(df["average_value"].mean()),
        "avg_anomaly_count": float(df["anomaly_count"].mean()),
        "max_anomaly_count": int(df["anomaly_count"].max()),
    }

    summary_path = os.path.join(output_dir, "red_team_simulation_summary.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        for key, value in summary.items():
            f.write(f"{key}: {value}\n")


if __name__ == "__main__":
    dataframe = run_red_team_simulation()
    save_outputs(dataframe)
    print("Red-team stimulation complete. Outputs written to ./outputs")
