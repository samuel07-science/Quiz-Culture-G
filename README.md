# Quiz Culture G

Bienvenue dans **Quiz Culture G** ! Ce petit jeu vous invite à faire travailler
votre mémoire, à tester vos connaissances et, surtout, à découvrir de nouvelles
choses sans pression. Choisissez un niveau, prenez le temps de réfléchir et
voyez jusqu'où votre curiosité vous mène.

## Jouer

Le projet ne demande ni installation ni compilation. Comme le jeu charge ses
questions depuis un fichier JSON, ouvrez-le avec un petit serveur local plutôt
qu'en double-cliquant sur `index.html` :

- **Avec Visual Studio Code** : ouvrez le dossier dans l'extension Live Server,
  puis choisissez **Open with Live Server** sur `index.html`.
- **Avec Python** : depuis le dossier du projet, lancez
  `python -m http.server 8000`, puis ouvrez <http://localhost:8000>.

## Comment jouer

1. Choisissez votre niveau de difficulté, de 1 à 4.
2. Sélectionnez **Débuter** : une manche de dix questions au maximum est tirée
   au hasard parmi celles accessibles à ce niveau.
3. Cliquez sur une réponse, ou utilisez les touches `1` à `4`. La correction
   s'affiche aussitôt.
4. Chaque erreur coûte un point de vie. La partie s'arrête lorsque les trois
   points de vie sont perdus ; sinon, terminez la manche avec **Suivant**, puis
   découvrez votre résultat.
5. Choisissez **Nouvelle partie** pour rejouer avec une nouvelle sélection.

Le bouton du soleil et de la lune permet de changer l'apparence du jeu.

## Ce que vous trouverez dans le projet

- `index.html` : les écrans d'accueil, de question et de résultat.
- `css/styles.css` : la mise en page, les couleurs, les thèmes clair et sombre
  ainsi que les adaptations aux petits écrans.
- `js/script.js` : le chargement des questions, le déroulement d'une manche,
  les réponses, les points de vie et le calcul du score.
- `questions.json` : les questions et leurs choix de réponse.
- `assets/` : les images et icônes du projet.

Le jeu est réalisé avec les technologies du navigateur : **HTML, CSS et
JavaScript natifs**, sans framework ni dépendance à installer.

## Ajouter une question

Les questions sont des objets dans le tableau de `questions.json`. Chaque objet
contient l'énoncé, quatre choix, l'index de la bonne réponse (en commençant à
zéro) et un niveau de difficulté de 1 à 4 :

```json
{
  "question": "Quelle planète est surnommée la planète rouge ?",
  "choices": ["Vénus", "Mars", "Jupiter", "Mercure"],
  "answer": 1,
  "difficulty": 1
}
```

Pour que le fichier reste valide, séparez les objets par des virgules, mais
n'ajoutez pas de virgule après le dernier. Pensez aussi à vérifier que
`answer` désigne bien l'un des choix.

## Pour apprendre en explorant

Vous pouvez suivre le parcours d'une réponse dans `js/script.js` : le jeu
sélectionne d'abord les questions du niveau choisi, en mélange l'ordre, puis
affiche les choix et met à jour le score et les points de vie. Les questions
sont construites avec les méthodes du DOM, tandis que leurs textes sont
insérés comme du texte plutôt que comme du HTML.

Amusez-vous bien, et bonne découverte !
