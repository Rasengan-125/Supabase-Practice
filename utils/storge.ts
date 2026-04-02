import { File } from "expo-file-system";
import { supabase } from "./supabase";

export const uploadImage = async (userId: string, imageUri: string) => {
  try {
    const fileExtension = imageUri.split(".").pop() || "jpg";
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;
    const file = new File(imageUri);
    const bytes = await file.bytes();

    const { error } = await supabase.storage
      .from("book_image")
      .upload(fileName, bytes, {
        contentType: `image/${fileExtension}`,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("book_image")
      .getPublicUrl(fileName);

    return `${urlData.publicUrl}?t=${Date.now()}`;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
