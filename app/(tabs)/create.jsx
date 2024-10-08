import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { ResizeMode, Video } from "expo-av";

import CustomBtn from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { icons } from "../../constants";
import { createVideo } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { router } from "expo-router";
import Loading from "../../components/Loading";

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    video: null,
    thumbnail: null,
    details: "",
  });

  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        selectType === "image"
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    console.log("Breaks here");

    console.log({ file_size: result.assets[0].fileSize });

    if (result.assets[0].fileSize > 10000000) {
      return Alert.alert("Error", "File size too large");
    }

    if (!result.canceled) {
      if (selectType === "image") {
        setForm({ ...form, thumbnail: result.assets[0] });
      }
      if (selectType === "video") {
        setForm({ ...form, video: result.assets[0] });
      }
    } else {
      // setTimeout(() => {
      //   Alert.alert("Document picked", JSON.stringify(result, null, 2));
      // }, 100);
    }
  };
  const submit = async () => {
    if (!form.details || !form.title || !form.thumbnail || !form.video) {
      return Alert.alert("Please fill in all the fields");
    }
    setUploading(true);
    try {
      await createVideo({ ...form, userId: user.$id });
      Alert.alert("Success!!", "Post uploaded successfully");
      setForm({
        title: "",
        video: null,
        thumbnail: null,
        details: "",
      });
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">Upload Video</Text>
        <FormField
          title="Video Title"
          value={form.title}
          placeholder={"Give your video a catch title"}
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
        />
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Video
          </Text>
          <TouchableOpacity onPress={() => openPicker("video")}>
            {form.video ? (
              <Video
                source={{ uri: form.video.uri }}
                className="w-full h-64 rounded-2xl"
                useNativeControls
                resizeMode={ResizeMode.COVER}
                isLooping
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100  rounded-2xl justify-center items-center ">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image
                    source={icons.upload}
                    className="w-1/2 h-1/2"
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Thumbnail Image
          </Text>
          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View
                className="w-full h-16 border-2 border-black-200 px-4 bg-black-100  rounded-2xl justify-center items-center
              flex-row space-x-2
              "
              >
                <Image
                  source={icons.upload}
                  className="w-1/2 h-1/2"
                  resizeMode="contain"
                />
                <Text className="text-sm text-gray-100 font-pmedium   ">
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <FormField
          title="Details"
          value={form.details}
          placeholder={"Video Description"}
          handleChangeText={(e) => setForm({ ...form, details: e })}
          otherStyles="mt-7"
        />
        <CustomBtn
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        ></CustomBtn>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
