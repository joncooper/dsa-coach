object Solution {
  private case class Ingredient(amount: Int, name: String)
  private val Recipe = raw"(\w+) requires (.+)\.".r
  private val IngredientRule = raw"(\d+) (\w+)".r

  def count_dependents_on_paste(inputText: String): Int = {
    val children = parseRecipes(inputText)
    val parents = scala.collection.mutable.Map.empty[String, scala.collection.mutable.ArrayBuffer[String]]

    for ((parent, ingredients) <- children; ingredient <- ingredients) {
      parents.getOrElseUpdate(ingredient.name, scala.collection.mutable.ArrayBuffer.empty) += parent
    }

    val seen = scala.collection.mutable.Set.empty[String]
    val stack = scala.collection.mutable.ArrayBuffer.empty[String]
    stack ++= parents.getOrElse("binding_paste", Seq.empty)

    while (stack.nonEmpty) {
      val item = stack.remove(stack.length - 1)
      if (!seen(item)) {
        seen += item
        stack ++= parents.getOrElse(item, Seq.empty)
      }
    }

    seen.size
  }

  private def parseRecipes(inputText: String): Map[String, Vector[Ingredient]] =
    inputText.linesIterator.map(_.trim).filter(_.nonEmpty).flatMap {
      case Recipe(name, "nothing") => Some(name -> Vector.empty[Ingredient])
      case Recipe(name, ingredientsText) =>
        val ingredients = IngredientRule.findAllMatchIn(ingredientsText).map { m =>
          Ingredient(m.group(1).toInt, m.group(2))
        }.toVector
        Some(name -> ingredients)
      case _ => None
    }.toMap
}
