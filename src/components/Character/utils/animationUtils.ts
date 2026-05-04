import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { eyebrowBoneNames, typingBoneNames } from "../../../data/boneData";

const setAnimations = (gltf: GLTF) => {
  const character = gltf.scene;
  const mixer = new THREE.AnimationMixer(character);
  const hasClips = gltf.animations && gltf.animations.length > 0;

  if (hasClips) {
    const introClip = gltf.animations.find((c) => c.name === "introAnimation");
    if (introClip) {
      const introAction = mixer.clipAction(introClip);
      introAction.setLoop(THREE.LoopOnce, 1);
      introAction.clampWhenFinished = true;
      introAction.play();
    }

    const keyClips = ["key1", "key2", "key5", "key6"];
    keyClips.forEach((name) => {
      const clip = THREE.AnimationClip.findByName(gltf.animations, name);
      if (clip) {
        const action = mixer.clipAction(clip);
        action.play();
        action.timeScale = 1.2;
      }
    });

    const typingAction = createBoneAction(gltf, mixer, "typing", typingBoneNames);
    if (typingAction) {
      typingAction.enabled = true;
      typingAction.play();
      typingAction.timeScale = 1.2;
    }
  }

  function startIntro() {
    if (!hasClips) return; // static mesh — no clips to play
    const introClip = gltf.animations.find((c) => c.name === "introAnimation");
    if (!introClip) return;
    const introAction = mixer.clipAction(introClip);
    introAction.clampWhenFinished = true;
    introAction.reset().play();
    setTimeout(() => {
      const blink = gltf.animations.find((c) => c.name === "Blink");
      if (blink) mixer.clipAction(blink).play().fadeIn(0.5);
    }, 2500);
  }

  function hover(gltf: GLTF, hoverDiv: HTMLDivElement) {
    if (!hasClips) return; // static mesh — no eyebrow bones
    const eyeBrowUpAction = createBoneAction(gltf, mixer, "browup", eyebrowBoneNames);
    if (!eyeBrowUpAction) return;

    let isHovering = false;
    eyeBrowUpAction.setLoop(THREE.LoopOnce, 1);
    eyeBrowUpAction.clampWhenFinished = true;
    eyeBrowUpAction.enabled = true;

    const onEnter = () => {
      if (!isHovering) {
        isHovering = true;
        eyeBrowUpAction.reset();
        eyeBrowUpAction.enabled = true;
        eyeBrowUpAction.setEffectiveWeight(4);
        eyeBrowUpAction.fadeIn(0.5).play();
      }
    };
    const onLeave = () => {
      if (isHovering) {
        isHovering = false;
        eyeBrowUpAction.fadeOut(0.6);
      }
    };
    hoverDiv.addEventListener("mouseenter", onEnter);
    hoverDiv.addEventListener("mouseleave", onLeave);
    return () => {
      hoverDiv.removeEventListener("mouseenter", onEnter);
      hoverDiv.removeEventListener("mouseleave", onLeave);
    };
  }

  return { mixer, startIntro, hover };
};

const createBoneAction = (
  gltf: GLTF,
  mixer: THREE.AnimationMixer,
  clip: string,
  boneNames: string[]
): THREE.AnimationAction | null => {
  const animClip = THREE.AnimationClip.findByName(gltf.animations, clip);
  if (!animClip) return null;
  const filtered = filterAnimationTracks(animClip, boneNames);
  return mixer.clipAction(filtered);
};

const filterAnimationTracks = (
  clip: THREE.AnimationClip,
  boneNames: string[]
): THREE.AnimationClip => {
  const filteredTracks = clip.tracks.filter((track) =>
    boneNames.some((name) => track.name.includes(name))
  );
  return new THREE.AnimationClip(clip.name + "_filtered", clip.duration, filteredTracks);
};

export default setAnimations;
