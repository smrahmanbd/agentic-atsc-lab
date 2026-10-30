"""Small, consistent matplotlib figures for the website."""
from __future__ import annotations

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

PAL = ["#3b2a7a", "#0f766e", "#b45309", "#9f1239", "#475569", "#1d4ed8"]


def _style(ax, title, ylabel, xlabel=""):
    ax.set_title(title, fontsize=12, loc="left", fontweight="bold")
    ax.set_ylabel(ylabel)
    if xlabel:
        ax.set_xlabel(xlabel)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", alpha=0.3)


def bars(labels, values, title, ylabel, path, highlight=None, fmt="{:.1f}"):
    fig, ax = plt.subplots(figsize=(7.2, 3.8), dpi=150)
    cols = [PAL[0] if (highlight is None or i == highlight) else "#94a3b8" for i in range(len(values))]
    b = ax.bar(labels, values, color=cols)
    for r, v in zip(b, values):
        ax.annotate(fmt.format(v), (r.get_x() + r.get_width() / 2, r.get_height()), ha="center",
                    va="bottom", fontsize=9, xytext=(0, 2), textcoords="offset points")
    _style(ax, title, ylabel)
    plt.xticks(fontsize=9)
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def lines(x, series, title, ylabel, xlabel, path, markers=True):
    fig, ax = plt.subplots(figsize=(7.2, 3.8), dpi=150)
    for i, (name, ys) in enumerate(series.items()):
        ax.plot(x, ys, label=name, color=PAL[i % len(PAL)], marker="o" if markers else None, lw=2)
    _style(ax, title, ylabel, xlabel)
    ax.legend(frameon=False, fontsize=9)
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)
