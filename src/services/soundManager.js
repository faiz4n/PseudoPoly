/**
 * PseudoPoly Sound Manager
 * Handles low-latency playback of extracted game audio effects
 */

// Import sound files directly so Vite bundles them properly
import diceRollSound from "../sounds/dice_roll.mp3";
import diceRollDoubleSound from "../sounds/dice_roll_double.mp3";
import stepSound from "../sounds/step.mp3";
import stepLeftSound from "../sounds/step_left.mp3";
import stepRightSound from "../sounds/step_right.mp3";
import getMoneySound from "../sounds/get_money.mp3";
import spendMoneySound from "../sounds/spend_money.mp3";
import jailSound from "../sounds/cell_jail.mp3";
import jailOutSound from "../sounds/jail_out.mp3";
import robberSound from "../sounds/cell_robber.mp3";
import chanceSound from "../sounds/cell_chance.mp3";
import gpSound from "../sounds/cell_gp.mp3";
import taxSound from "../sounds/cell_tax.mp3";
import winSound from "../sounds/game_win.mp3";
import loseSound from "../sounds/game_lose.mp3";
import buttonClickSound from "../sounds/button_press.mp3";
import turnStartSound from "../sounds/turn_start.mp3";
import errorSound from "../sounds/error.mp3";

class SoundManager {
  constructor() {
    this.soundPool = {};
    this.stepToggle = false;
    this.isMuted = false;
    this.volume = 1.0;
    this.audioUnlocked = false;

    // Load sound settings from localStorage
    try {
      const storedMute = localStorage.getItem("pseudopoly_sound_muted");
      if (storedMute !== null) this.isMuted = storedMute === "true";
      const storedVol = localStorage.getItem("pseudopoly_sound_vol");
      if (storedVol !== null) this.volume = parseFloat(storedVol) || 1.0;
    } catch {}

    this.soundMap = {
      dice_roll: diceRollSound,
      dice_roll_double: diceRollDoubleSound,
      step: stepSound,
      step_left: stepLeftSound,
      step_right: stepRightSound,
      get_money: getMoneySound,
      spend_money: spendMoneySound,
      jail: jailSound,
      jail_out: jailOutSound,
      robber: robberSound,
      chance: chanceSound,
      gp: gpSound,
      tax: taxSound,
      win: winSound,
      lose: loseSound,
      button: buttonClickSound,
      turn_start: turnStartSound,
      error: errorSound,
    };

    this.preloadCommon();
  }

  preloadCommon() {
    if (typeof window === "undefined") return;
    // Preload top frequently used sounds into audio pools
    const frequent = ["step", "button", "get_money", "spend_money", "dice_roll_double"];
    frequent.forEach((key) => {
      this.getAudioInstance(key);
    });
  }

  unlockAudio() {
    if (this.audioUnlocked || typeof window === "undefined") return;
    this.audioUnlocked = true;
    try {
      const silent = new Audio(stepSound);
      silent.volume = 0.01;
      silent.play().then(() => {
        silent.pause();
        silent.currentTime = 0;
      }).catch(() => {});
    } catch {}
  }

  getAudioInstance(key) {
    const src = this.soundMap[key];
    if (!src) return null;

    if (!this.soundPool[key]) {
      this.soundPool[key] = [];
    }

    // Reuse an idle instance or create a new one (pool up to 4 concurrent per sound)
    const pool = this.soundPool[key];
    let audio = pool.find((a) => a.paused || a.ended);
    if (!audio && pool.length < 4) {
      audio = new Audio(src);
      audio.preload = "auto";
      pool.push(audio);
    }

    if (!audio) {
      audio = pool[0];
    }

    return audio;
  }

  play(key, customVolume = null) {
    if (this.isMuted || typeof window === "undefined") return;

    try {
      const audio = this.getAudioInstance(key);
      if (!audio) return;

      const finalVol = Math.max(
        0,
        Math.min(1, (customVolume !== null ? customVolume : 1) * this.volume)
      );
      audio.volume = finalVol;
      audio.currentTime = 0;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play policy blocked or device interrupted
        });
      }
    } catch {}
  }

  // Specialized triggers
  playDiceRoll() {
    this.play("dice_roll_double", 0.95);
  }

  playStep() {
    this.stepToggle = !this.stepToggle;
    this.play(this.stepToggle ? "step_left" : "step_right", 0.7);
  }

  playCollectMoney() {
    this.play("get_money", 0.9);
  }

  playSpendMoney() {
    this.play("spend_money", 0.9);
  }

  playJail() {
    this.play("jail", 0.95);
  }

  playJailOut() {
    this.play("jail_out", 0.9);
  }

  playRobBank() {
    this.play("robber", 0.95);
  }

  playChance() {
    this.play("chance", 0.85);
  }

  playParking() {
    this.play("gp", 0.9);
  }

  playTax() {
    this.play("tax", 0.9);
  }

  playWin() {
    this.play("win", 1.0);
  }

  playLose() {
    this.play("lose", 1.0);
  }

  playButtonClick() {
    this.play("button", 0.6);
  }

  playTurnStart() {
    this.play("turn_start", 0.85);
  }

  playError() {
    this.play("error", 0.8);
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    try {
      localStorage.setItem("pseudopoly_sound_muted", String(this.isMuted));
    } catch {}
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, parseFloat(vol) || 1.0));
    try {
      localStorage.setItem("pseudopoly_sound_vol", String(this.volume));
    } catch {}
  }
}

export const soundManager = new SoundManager();
export default soundManager;
